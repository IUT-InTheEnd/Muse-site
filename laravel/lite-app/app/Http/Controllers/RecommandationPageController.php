<?php

namespace App\Http\Controllers;

use App\Jobs\RefreshUserRecommendations;
use App\Models\UserEcoute;
use App\Services\RecommendationCacheService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RecommandationPageController extends Controller
{
    public function __construct(
        private RecommendationCacheService $recommendationCache,
    ) {}

    public function index()
    {
        $user = auth()->user();

        $lastListenTrack = UserEcoute::where('user_id', $user->id)
            ->with(['track.realisers.artist'])
            ->orderByDesc('last_listen')
            ->first();

        $lastListenFormatted = $lastListenTrack && $lastListenTrack->track
            ? [
                'id' => $lastListenTrack->track->track_id,
                'title' => $lastListenTrack->track->track_title,
                'cover' => $lastListenTrack->track->track_image_file,
                'artist' => $lastListenTrack->track->realisers->first()?->artist,
            ]
            : null;

        $keys = $this->recommendationCache->userKeys($user->id);

        $lastListenRecommendedTracks = Cache::get($keys['last_listen']);
        $popularTracks = Cache::get($keys['popular']);
        $recommendedTracks = Cache::get($keys['recommended']);

        $shouldQueueRefresh = $lastListenRecommendedTracks === null
            || $popularTracks === null
            || $recommendedTracks === null
            || $recommendedTracks === []
            || ($lastListenFormatted !== null && $lastListenRecommendedTracks === []);

        if ($shouldQueueRefresh) {
            if ($this->recommendationCache->markRefreshQueued($user->id)) {
                RefreshUserRecommendations::dispatch($user->id);

                Log::info('Queued recommendation refresh after cache miss', [
                    'user_id' => $user->id,
                    'missing' => [
                        'last_listen' => $lastListenRecommendedTracks === null,
                        'popular' => $popularTracks === null,
                        'recommended' => $recommendedTracks === null,
                        'empty_last_listen' => $lastListenFormatted !== null && $lastListenRecommendedTracks === [],
                        'empty_recommended' => $recommendedTracks === [],
                    ],
                ]);
            }
        }

        return Inertia::render('recommandation/index', [
            'recommendedTracks' => $recommendedTracks ?? [],
            'popularTracks' => $popularTracks ?? [],
            'lastListenRecommendedTracks' => $lastListenRecommendedTracks ?? [],
            'lastListen' => $lastListenFormatted,
        ]);
    }
}
