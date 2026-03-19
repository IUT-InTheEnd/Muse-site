<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Services\RecommendationService;
use App\Services\TrackQueryService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private RecommendationService $recommendations,
        private TrackQueryService $tracks,
    ) {}

    public function index(): Response
    {
        if (auth()->check()) {
            return app(DashboardController::class)->index();
        }

        return Inertia::render('welcome', [
            'recommendedTracks' => $this->guestWelcomeRecommendations(),
            'newTracks' => $this->tracks->newTracks(),
        ]);
    }

    private function guestWelcomeRecommendations(): array
    {
        $cacheKey = 'guest_welcome_recommendation';
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            return $cached;
        }

        try {
            $trackIds = $this->recommendations->newUser(10);
        } catch (\Throwable $e) {
            Log::warning('Failed to build guest welcome recommendations', [
                'error' => $e->getMessage(),
            ]);

            return [];
        }

        $tracks = [];

        if (! empty($trackIds)) {
            $tracks = Track::with(['realisers.artist'])
                ->whereIn('track_id', $trackIds)
                ->get()
                ->map(fn ($track) => [
                    'id' => $track->track_id,
                    'title' => $track->track_title,
                    'cover' => $track->track_image_file,
                    'artist' => $track->realisers->first()?->artist,
                ])
                ->values()
                ->all();
        }

        Cache::put($cacheKey, $tracks, 4 * 60 * 60);

        return $tracks;
    }
}
