<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Track;
use App\Services\FavoritesQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoritesController extends Controller
{
    public function __construct(private FavoritesQueryService $favorites) {}

    public function index()
    {
        $user = auth()->user();

        return Inertia::render('favoris/index', [
            'tracks' => $this->favorites->favoriteTracks($user),
            'albums' => $this->favorites->favoriteAlbums($user),
            'artists' => $this->favorites->favoriteArtists($user),
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
        $exists = $this->favorites->isTrackFavorite($user, $trackId);

        if ($exists) {
            $favoritesPlaylist->tracks()->detach($trackId);
            $track = Track::find($trackId);
            $track->track_favorites = $track->track_favorites - 1;
            $track->save();

            return response()->json([
                'success' => true,
                'is_favorite' => false,
                'message' => 'Titre retire des favoris',
            ]);

        } else {
            $favoritesPlaylist->tracks()->attach($trackId);
            $favoritesPlaylist->playlist_date_updated = now();
            $favoritesPlaylist->save();

            $track = Track::find($trackId);
            $track->track_favorites = $track->track_favorites + 1;
            $track->save();

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
        $isFavorite = $this->favorites->isTrackFavorite($user, $trackId);

        return response()->json([
            'is_favorite' => $isFavorite,
        ]);
    }

    public function toggleAlbum(Request $request): JsonResponse
    {
        $request->validate([
            'album_id' => 'required|integer|exists:album,album_id',
        ]);

        $user = auth()->user();
        $albumId = $request->input('album_id');

        // Check si l'album est deja dans les favoris
        $exists = $this->favorites->isAlbumFavorite($user, $albumId);

        if ($exists) {
            $user->albums()->detach($albumId);
            $album = Album::find($albumId);
            $album->album_favorites = $album->album_favorites - 1;
            $album->save();

            return response()->json([
                'success' => true,
                'is_favorite' => false,
                'message' => 'Album retire de la bibliotheque',
            ]);
        } else {
            $user->albums()->attach($albumId);
            $album = Album::find($albumId);
            $album->album_favorites = $album->album_favorites + 1;
            $album->save();

            return response()->json([
                'success' => true,
                'is_favorite' => true,
                'message' => 'Album ajoute a la bibliotheque',
            ]);
        }
    }

    public function checkAlbum(Request $request): JsonResponse
    {
        $request->validate([
            'album_id' => 'required|integer',
        ]);

        $user = auth()->user();
        $albumId = $request->input('album_id');
        $isFavorite = $this->favorites->isAlbumFavorite($user, $albumId);

        return response()->json([
            'is_favorite' => $isFavorite,
        ]);
    }
}
