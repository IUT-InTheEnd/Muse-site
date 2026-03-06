<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Track;
use App\Models\UserEcoute;
use App\Models\UserPrefereArtiste;
use App\Services\RecommendationService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private RecommendationService $recommendations) {}

    public function index()
    {
        $user = auth()->user();

        // Tracks récemment écoutés
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

        // Recommandations personnalisées — mises en cache 4 heures
        $cacheKey = "recommended_tracks_user_{$user->id}";
        $recommendedTracks = Cache::remember($cacheKey, 4 * 60 * 60, function () use ($user) {
            try {
                $trackIds = $this->recommendations->userBased($user->id);
            } catch (\Throwable) {
                return [];
            }

            if (empty($trackIds)) {
                return [];
            }

            return Track::with(['realisers.artist'])
                ->whereIn('track_id', $trackIds)
                ->get()
                ->map(fn ($track) => [
                    'id' => $track->track_id,
                    'title' => $track->track_title,
                    'cover' => $track->track_image_file,
                    'artist' => optional($track->realisers->first()?->artist)->artist_name,
                ])
                ->toArray();
        });

        // Artistes recommandés
        $artists = Artist::whereIn('artist_id', UserPrefereArtiste::where('user_id', $user->id)->pluck('artist_id'))
            ->get()
            ->map(fn ($artist) => [
                'id' => $artist->artist_id,
                'name' => $artist->artist_name,
                'cover' => $artist->artist_image_file,
            ]);

        // Nouveaux titres
        $newTracks = Track::with(['realisers.artist'])
            ->whereNotNull('track_date_created')
            ->orderBy('track_date_created', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($track) => [
                'id' => $track->track_id,
                'title' => $track->track_title,
                'cover' => $track->track_image_file,
                'artist' => optional($track->realisers->first()?->artist)->artist_name,
            ]);

        return Inertia::render('dashboard', [
            'user' => ['name' => $user->name],
            'recentTracks' => $recentTracks,
            'recommendedTracks' => $recommendedTracks,
            'newTracks' => $newTracks,
            'artists' => $artists,
        ]);
    }
}
