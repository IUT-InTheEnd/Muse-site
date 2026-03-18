<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserAjouteAlbumFavori;
use App\Models\UserPrefereArtiste;
use Illuminate\Support\Collection;

class FavoritesQueryService
{
    public function favoriteTracks(User $user): Collection
    {
        return $user->getFavoritesPlaylist()
            ->tracks()
            ->with('realisers.artist')
            ->get()
            ->map(function ($track) {
                return [
                    'id' => $track->track_id,
                    'title' => $track->track_title,
                    'cover' => $track->track_image_file,
                    'duration' => $track->track_duration,
                    'listens' => $track->track_listens,
                    'artist' => $track->realisers->first()?->artist,
                ];
            });
    }

    public function favoriteAlbums(User $user): Collection
    {
        return UserAjouteAlbumFavori::where('user_id', $user->id)
            ->with('album')
            ->get()
            ->pluck('album')
            ->filter()
            ->map(function ($album) {
                return [
                    'id' => $album->album_id,
                    'title' => $album->album_title,
                    'cover' => $album->album_image_file,
                ];
            });
    }

    public function favoriteArtists(User $user): Collection
    {
        return UserPrefereArtiste::where('user_id', $user->id)
            ->with('artist')
            ->get()
            ->map(function ($userArtist) {
                $artist = $userArtist->artist;
                if (! $artist) {
                    return null;
                }

                return [
                    'id' => $artist->artist_id,
                    'name' => $artist->artist_name,
                    'cover' => $artist->artist_image_file,
                ];
            })
            ->filter();
    }

    public function isTrackFavorite(User $user, int $trackId): bool
    {
        return $user->getFavoritesPlaylist()
            ->tracks()
            ->where('track.track_id', $trackId)
            ->exists();
    }

    public function isAlbumFavorite(User $user, int $albumId): bool
    {
        return $user->albums()
            ->where('user_ajoute_album_favoris.album_id', $albumId)
            ->exists();
    }
}
