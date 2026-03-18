<?php

namespace App\Services;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Realiser;
use App\Models\Track;
use App\Models\User;
use Illuminate\Support\Collection;

class ArtistPageQueryService
{
    public function artistOrFail(string $id): Artist
    {
        return Artist::findOrFail($id);
    }

    public function isFollowing(?User $user, string $artistId): bool
    {
        if (! $user) {
            return false;
        }

        return $user->artists()
            ->where('artist.artist_id', $artistId)
            ->exists();
    }

    public function tracksForArtist(string $artistId): Collection
    {
        return Track::whereHas('realisers', function ($query) use ($artistId) {
            $query->where('artist_id', $artistId);
        })
            ->with('realisers.artist')
            ->get()
            ->map(function ($track) {
                return [
                    'id' => $track->track_id,
                    'title' => $track->track_title,
                    'url' => $track->track_file,
                    'artwork' => $track->track_image_file,
                    'duration' => $track->track_duration,
                    'favorites' => $track->track_favorites,
                    'likes' => $track->track_likes,
                    'dislikes' => $track->track_dislikes,
                    'listens' => $track->track_listens,
                    'date' => $track->track_date_created ?? '',
                ];
            });
    }

    public function albumsForArtist(string $artistId): Collection
    {
        $albumIds = $this->albumIdsForArtist($artistId);

        return Album::whereIn('album_id', $albumIds)
            ->orderBy('album_date_created', 'desc')
            ->get()
            ->map(function ($album) {
                return [
                    'id' => $album->album_id,
                    'title' => $album->album_title,
                    'date' => $album->album_date_created ? $album->album_date_created->toDateString() : null,
                    'type' => $album->album_type,
                    'artwork' => $album->album_image_file,
                ];
            });
    }

    public function albumsWithTracksForArtist(string $artistId): Collection
    {
        $albumIds = $this->albumIdsForArtist($artistId);

        return Album::whereIn('album_id', $albumIds)
            ->get()
            ->map(function ($album) {
                $realisers = Realiser::where('album_id', $album->album_id)
                    ->with('track', 'artist')
                    ->get();

                $albumTracks = $realisers->map(function ($realiser) {
                    return [
                        'id' => $realiser->track->track_id,
                        'title' => $realiser->track->track_title,
                        'url' => $realiser->track->track_file,
                        'artwork' => $realiser->track->track_image_file,
                        'duration' => $realiser->track->track_duration,
                        'listens' => $realiser->track->track_listens,
                        'favorites' => $realiser->track->track_favorites,
                        'likes' => $realiser->track->track_likes,
                        'dislikes' => $realiser->track->track_dislikes,
                        'date' => $realiser->track->track_date_created ?? '',
                        'artist' => [
                            'id' => $realiser->artist->artist_id,
                            'name' => $realiser->artist->artist_name,
                        ],
                    ];
                })->toArray();

                return [
                    'id' => $album->album_id,
                    'title' => $album->album_title,
                    'date' => $album->album_date_created ?? '',
                    'type' => $album->album_type,
                    'artwork' => $album->album_image_file,
                    'tracks' => $albumTracks,
                ];
            });
    }

    private function albumIdsForArtist(string $artistId): array
    {
        return Realiser::where('artist_id', $artistId)
            ->pluck('album_id')
            ->unique()
            ->filter()
            ->toArray();
    }
}
