<?php

namespace App\Http\Controllers;

use App\Models\UserAjouteAlbumFavori;
use App\Models\UserPrefereArtiste;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoritesController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $favoritesPlaylist = $user->getFavoritesPlaylist();

        $favoriteTracks = $favoritesPlaylist->tracks()
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

        $favoriteAlbums = UserAjouteAlbumFavori::where('user_id', $user->id)
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

        $favoriteArtists = UserPrefereArtiste::where('user_id', $user->id)
            ->with('artist')
            ->get()
            ->pluck('artist')
            ->filter()
            ->map(function ($artist) {
                return [
                    'artist_id' => $artist->id,
                    'artist_name' => $artist->artist_name,
                    'artist_image_file' => $artist->artist_image_file,
                ];
            });

        return Inertia::render('favoris/index', [
            'tracks' => $favoriteTracks,
            'albums' => $favoriteAlbums,
            'artists' => $favoriteArtists,
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'track_id' => 'required|integer|exists:track,track_id',
        ]);

        $user = auth()->user();
        $trackId = $request->input('track_id');
        $favoritesPlaylist = $user->getFavoritesPlaylist();

        // Check si la musique est deja dans les favoris
        $exists = $favoritesPlaylist->tracks()
            ->where('track.track_id', $trackId)
            ->exists();

        if ($exists) {
            $favoritesPlaylist->tracks()->detach($trackId);

            return response()->json([
                'success' => true,
                'is_favorite' => false,
                'message' => 'Titre retire des favoris',
            ]);
        } else {
            $favoritesPlaylist->tracks()->attach($trackId);
            $favoritesPlaylist->playlist_date_updated = now();
            $favoritesPlaylist->save();

            return response()->json([
                'success' => true,
                'is_favorite' => true,
                'message' => 'Titre ajoute aux favoris',
            ]);
        }
    }

    public function check(Request $request): JsonResponse
    {
        $request->validate([
            'track_id' => 'required|integer',
        ]);

        $user = auth()->user();
        $trackId = $request->input('track_id');
        $favoritesPlaylist = $user->getFavoritesPlaylist();

        $isFavorite = $favoritesPlaylist->tracks()
            ->where('track.track_id', $trackId)
            ->exists();

        return response()->json([
            'is_favorite' => $isFavorite,
        ]);
    }
}
