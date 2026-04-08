<?php

namespace App\Http\Controllers;

use App\Services\TrackQueryService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private TrackQueryService $tracks,
    ) {}

    public function index(): Response
    {
        if (auth()->check()) {
            return app(DashboardController::class)->index();
        }

        return Inertia::render('welcome', [
            'recommendedTracks' => $this->tracks->guestRecommendedTracks(),
            'newTracks' => $this->tracks->newTracks(),
        ]);
    }
}
