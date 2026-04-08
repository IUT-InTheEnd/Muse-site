<?php

namespace App\Services;

use App\Jobs\RefreshUserRecommendations;
use App\Models\Track;
use App\Models\UserEcoute;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RecommendationCacheService
{
    private const CACHE_TTL_SECONDS = 14400;

    public function __construct(
        private RecommendationService $recommendations,
    ) {}

    /**
     * @return array{last_listen:string,popular:string,recommended:string,refresh_lock:string}
     */
    public function userKeys(int $userId): array
    {
        return [
            'last_listen' => "last_listen_reco_user_{$userId}",
            'popular' => "popular_tracks_user_{$userId}",
            'recommended' => "recommended_tracks_user_{$userId}",
            'refresh_lock' => "recommendations_refresh_queued_user_{$userId}",
        ];
    }

    public function invalidateUserRecommendations(int $userId): void
    {
        $keys = $this->userKeys($userId);

        Cache::forget($keys['last_listen']);
        Cache::forget($keys['popular']);
        Cache::forget($keys['recommended']);
        Cache::forget($keys['refresh_lock']);
    }

    public function invalidateAndDispatchRefresh(int $userId): bool
    {
        $this->invalidateUserRecommendations($userId);

        if (! $this->markRefreshQueued($userId)) {
            Log::info('Skipped recommendation refresh dispatch because one is already queued', [
                'user_id' => $userId,
            ]);

            return false;
        }

        RefreshUserRecommendations::dispatch($userId);

        Log::info('Dispatched recommendation refresh job', [
            'user_id' => $userId,
        ]);

        return true;
    }

    public function markRefreshQueued(int $userId, int $lockSeconds = 300): bool
    {
        return Cache::add($this->userKeys($userId)['refresh_lock'], true, $lockSeconds);
    }

    public function clearRefreshQueued(int $userId): void
    {
        Cache::forget($this->userKeys($userId)['refresh_lock']);
    }

    /**
     * @return array{
     *     recommendedTracks: array<int, array<string, mixed>>,
     *     popularTracks: array<int, array<string, mixed>>,
     *     lastListenRecommendedTracks: array<int, array<string, mixed>>,
     *     lastListen: array<string, mixed>|null
     * }
     */
    public function refreshUserRecommendations(int $userId): array
    {
        $keys = $this->userKeys($userId);
        $startedAt = microtime(true);

        Log::info('Refreshing user recommendations', [
            'user_id' => $userId,
        ]);

        try {
            $lastListenTrack = UserEcoute::where('user_id', $userId)
                ->with(['track.realisers.artist'])
                ->orderByDesc('last_listen')
                ->first();

            $lastTrackId = $lastListenTrack?->track_id;

            $lastListen = $lastListenTrack && $lastListenTrack->track
                ? [
                    'id' => $lastListenTrack->track->track_id,
                    'title' => $lastListenTrack->track->track_title,
                    'cover' => $lastListenTrack->track->track_image_file,
                    'artist' => $lastListenTrack->track->realisers->first()?->artist,
                ]
                : null;

            $lastListenRecommendedTracks = [];
            if ($lastTrackId) {
                try {
                    $lastListenRecommendedTracks = $this->getTracksFromIds(
                        $this->recommendations->echoNest($userId, $lastTrackId)
                    );
                } catch (\Throwable $e) {
                    Log::warning('Failed last listen recommendations refresh', [
                        'user_id' => $userId,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $popularTracks = [];
            try {
                $popularTracks = $this->getTracksFromIds(
                    $this->recommendations->userBased($userId)
                );
            } catch (\Throwable $e) {
                Log::warning('Failed popular recommendations refresh', [
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
            }

            $recommendedTracks = [];
            if ($lastTrackId) {
                try {
                    $recommendedTracks = $this->getTracksFromIds(
                        $this->recommendations->itemBasedMathieu($lastTrackId)
                    );
                } catch (\Throwable $e) {
                    Log::warning('Failed general recommendations refresh', [
                        'user_id' => $userId,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Cache::put($keys['last_listen'], $lastListenRecommendedTracks, self::CACHE_TTL_SECONDS);
            Cache::put($keys['popular'], $popularTracks, self::CACHE_TTL_SECONDS);
            Cache::put($keys['recommended'], $recommendedTracks, self::CACHE_TTL_SECONDS);

            Log::info('Finished refreshing user recommendations', [
                'user_id' => $userId,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'counts' => [
                    'last_listen' => count($lastListenRecommendedTracks),
                    'popular' => count($popularTracks),
                    'recommended' => count($recommendedTracks),
                ],
            ]);

            return [
                'recommendedTracks' => $recommendedTracks,
                'popularTracks' => $popularTracks,
                'lastListenRecommendedTracks' => $lastListenRecommendedTracks,
                'lastListen' => $lastListen,
            ];
        } finally {
            $this->clearRefreshQueued($userId);
        }
    }

    /**
     * @param  int[]  $trackIds
     * @return array<int, array<string, mixed>>
     */
    private function getTracksFromIds(array $trackIds): array
    {
        if ($trackIds === []) {
            return [];
        }

        $tracks = Track::with(['realisers.artist'])
            ->whereIn('track_id', $trackIds)
            ->get();

        return $tracks->map(fn ($track) => [
            'id' => $track->track_id,
            'title' => $track->track_title,
            'cover' => $track->track_image_file,
            'artist' => $track->realisers->first()?->artist,
        ])->toArray();
    }
}
