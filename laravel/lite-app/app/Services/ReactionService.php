<?php

namespace App\Services;

use App\Models\Album;
use App\Models\AlbumReaction;
use App\Models\Track;
use App\Models\TrackReaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ReactionService
{
    public function reactToTrack(Track $track, ?User $user, ?string $visitorId, ?string $reaction): array
    {
        return $this->react(
            content: $track,
            reactionModel: new TrackReaction(),
            foreignKey: 'track_id',
            reaction: $reaction,
            user: $user,
            visitorId: $visitorId,
            likesColumn: 'track_likes',
            dislikesColumn: 'track_dislikes',
        );
    }

    public function reactToAlbum(Album $album, ?User $user, ?string $visitorId, ?string $reaction): array
    {
        return $this->react(
            content: $album,
            reactionModel: new AlbumReaction(),
            foreignKey: 'album_id',
            reaction: $reaction,
            user: $user,
            visitorId: $visitorId,
            likesColumn: 'album_likes',
            dislikesColumn: 'album_dislikes',
        );
    }

    public function trackReactionsFor(Request $request, iterable $trackIds): array
    {
        return $this->viewerReactionsFor(
            request: $request,
            model: new TrackReaction(),
            foreignKey: 'track_id',
            ids: $trackIds,
        );
    }

    public function albumReactionsFor(Request $request, iterable $albumIds): array
    {
        return $this->viewerReactionsFor(
            request: $request,
            model: new AlbumReaction(),
            foreignKey: 'album_id',
            ids: $albumIds,
        );
    }

    private function react(
        Model $content,
        Model $reactionModel,
        string $foreignKey,
        ?string $reaction,
        ?User $user,
        ?string $visitorId,
        string $likesColumn,
        string $dislikesColumn,
    ): array {
        $normalizedReaction = $this->normalizeReaction($reaction);

        if ($user === null && $visitorId === null) {
            throw new InvalidArgumentException('A visitor identifier is required for guests.');
        }

        return DB::transaction(function () use (
            $content,
            $reactionModel,
            $foreignKey,
            $normalizedReaction,
            $user,
            $visitorId,
            $likesColumn,
            $dislikesColumn,
        ) {
            $query = $reactionModel->newQuery()
                ->where($foreignKey, $content->getKey());

            if ($user !== null) {
                $query->where('user_id', $user->id);
            } else {
                $query->whereNull('user_id')->where('visitor_id', $visitorId);
            }

            /** @var Model|null $existing */
            $existing = $query->lockForUpdate()->first();
            $previousReaction = $existing?->reaction;

            if ($normalizedReaction === null) {
                if ($existing !== null) {
                    $existing->delete();
                }
            } elseif ($existing === null) {
                $reactionModel->newQuery()->create([
                    $foreignKey => $content->getKey(),
                    'user_id' => $user?->id,
                    'visitor_id' => $user === null ? $visitorId : null,
                    'reaction' => $normalizedReaction,
                ]);
            } elseif ($previousReaction !== $normalizedReaction) {
                $existing->update(['reaction' => $normalizedReaction]);
            }

            if ($previousReaction !== $normalizedReaction) {
                $increments = [
                    $likesColumn => 0,
                    $dislikesColumn => 0,
                ];

                if ($previousReaction === 'like') {
                    $increments[$likesColumn]--;
                } elseif ($previousReaction === 'dislike') {
                    $increments[$dislikesColumn]--;
                }

                if ($normalizedReaction === 'like') {
                    $increments[$likesColumn]++;
                } elseif ($normalizedReaction === 'dislike') {
                    $increments[$dislikesColumn]++;
                }

                $content->newQuery()
                    ->whereKey($content->getKey())
                    ->update([
                        $likesColumn => DB::raw(sprintf(
                            'CASE WHEN %1$s + (%2$d) < 0 THEN 0 ELSE %1$s + (%2$d) END',
                            $likesColumn,
                            $increments[$likesColumn],
                        )),
                        $dislikesColumn => DB::raw(sprintf(
                            'CASE WHEN %1$s + (%2$d) < 0 THEN 0 ELSE %1$s + (%2$d) END',
                            $dislikesColumn,
                            $increments[$dislikesColumn],
                        )),
                    ]);
            }

            $content->refresh();

            return [
                'reaction' => $normalizedReaction,
                'likes' => (int) ($content->{$likesColumn} ?? 0),
                'dislikes' => (int) ($content->{$dislikesColumn} ?? 0),
            ];
        });
    }

    private function viewerReactionsFor(Request $request, Model $model, string $foreignKey, iterable $ids): array
    {
        $ids = collect($ids)->filter()->map(fn ($id) => (int) $id)->unique()->values();

        if ($ids->isEmpty()) {
            return [];
        }

        $query = $model->newQuery()->whereIn($foreignKey, $ids);
        $this->applyActorConstraint($query, $request);

        return $query
            ->pluck('reaction', $foreignKey)
            ->map(fn ($reaction) => $this->normalizeReaction($reaction))
            ->all();
    }

    private function applyActorConstraint(Builder $query, Request $request): void
    {
        if ($request->user() !== null) {
            $query->where('user_id', $request->user()->id);

            return;
        }

        $visitorId = $request->cookie(VisitorIdService::COOKIE_NAME);

        if (! is_string($visitorId) || $visitorId === '') {
            $query->whereRaw('1 = 0');

            return;
        }

        $query->whereNull('user_id')->where('visitor_id', $visitorId);
    }

    private function normalizeReaction(?string $reaction): ?string
    {
        $normalized = $reaction === null ? null : strtolower(trim($reaction));

        return match ($normalized) {
            'like', 'dislike' => $normalized,
            'none', '' => null,
            null => null,
            default => throw new InvalidArgumentException('Unsupported reaction value.'),
        };
    }
}
