<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\AjouteFavori;
use App\Models\UserPrefereArtiste;
use App\Models\UserAjouteAlbumFavoris;

class FavoritesController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $favoriteTracks = AjouteFavori::where('user_id', $user->id)
            ->with('track.realisers.artist') // si tu as une relation Track → Realiser → Artist
            ->get()
            ->pluck('track')
            ->filter()
            ->map(function($track) {
                return [
                    'id' => $track->track_id,
                    'title' => $track->track_title,
                    'cover' => $track->track_image_file
                ];
            });

        return Inertia::render('favoris/index', [
            'tracks' => $favoriteTracks,
        ]);
    }
}