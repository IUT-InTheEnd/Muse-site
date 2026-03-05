<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Models\Artist;
use App\Models\UserEcoute;
use App\Models\UserPrefereArtiste;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        # tracks récemments ecoutés
        $recentTracks = UserEcoute::where('user_id', $user->id)
            ->with(['track.realisers.artist'])
            ->orderByDesc('last_listen')
            ->limit(10)
            ->get()
            ->map(function ($listen) {
                $track = $listen->track;

                return [
                    'id' => $track->track_id,
                    'title' => $track->track_title,
                    'cover' => $track->track_image_file,
                    'artist' => $track->realisers->first()?->artist,
                ];
            });


        # Recommandations (simple : titres populaires)
        $recommendedTracks = [];


        # Artistes récommandés
        $artists = [];

        
        # Nouveaux titres
        $newTracks = Track::with(['realisers.artist'])
            ->whereNotNull('track_date_created')
            ->orderBy('track_date_created', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($track) {
                return [
                    'id' => $track->track_id,
                    'title' => $track->track_title,
                    'cover' => $track->track_image_file,
                    'artist' => optional($track->realisers->first()?->artist)->artist_name,
                ];
            });

        return Inertia::render('dashboard', [
            'user' => [
                'name' => $user->name,
            ],
            'recentTracks' => $recentTracks,
            'recommendedTracks' => $recommendedTracks,
            'newTracks' => $newTracks,
            'artists' => $artists,
        ]);
    }
}