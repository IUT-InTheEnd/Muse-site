<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Inertia\Inertia;
use App\Services\RecommendationService;
use App\Models\UserEcoute;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RecommandationPageController extends Controller
{
    public function __construct(
        private RecommendationService $recommendations,
    ) {}

    public function index()
    {
        $user = auth()->user();

        // récupération du dernier track écouté
        $lastListenTrack = UserEcoute::where('user_id', $user->id)
            ->with(['track.realisers.artist'])
            ->orderByDesc('last_listen')
            ->first();

        $lastTrackId = $lastListenTrack?->track_id;

        $lastListenFormatted = $lastListenTrack && $lastListenTrack->track
            ? [
                'id' => $lastListenTrack->track->track_id,
                'title' => $lastListenTrack->track->track_title,
                'cover' => $lastListenTrack->track->track_image_file,
                'artist' => $lastListenTrack->track->realisers->first()?->artist,
            ]
            : null;

        // item-based sur la dernière écoute
        $cacheKeyLastListen = "last_listen_reco_user_{$user->id}";
        $lastListenRecommendedTracks = Cache::get($cacheKeyLastListen);

        if ($lastListenRecommendedTracks === null) {
            $trackIds = [];

            try {
                if ($lastTrackId) {
                    $trackIds = $this->recommendations->echoNest($user->id, $lastTrackId);
                }
            } catch (\Throwable $e) {
                Log::warning('Failed last listen recommendations', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }

            $lastListenRecommendedTracks = $this->getTracksFromIds($trackIds);

            if (!empty($lastListenRecommendedTracks)) {
                Cache::put($cacheKeyLastListen, $lastListenRecommendedTracks, 4 * 60 * 60);
            }
        }

        // user-based pour les recommandations populaires des autres utilisateurs
        $cacheKeyPopular = "popular_tracks_user_{$user->id}";
        $popularTracks = Cache::get($cacheKeyPopular);

        if ($popularTracks === null) {
            $trackIds = [];

            try {
                $trackIds = $this->recommendations->userBased($user->id);
            } catch (\Throwable $e) {
                Log::warning('Failed popular recommendations', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }

            $popularTracks = $this->getTracksFromIds($trackIds);

            if (!empty($popularTracks)) {
                Cache::put($cacheKeyPopular, $popularTracks, 4 * 60 * 60);
            }
        }

        // hybrid pour les recommandations générales sur l'utilisateur
        $cacheKeyRecommended = "recommended_tracks_user_{$user->id}";
        $recommendedTracks = Cache::get($cacheKeyRecommended);

        if ($recommendedTracks === null) {
            $trackIds = [];

            try {
                if ($lastTrackId) {
                    $trackIds = $this->recommendations->itemBasedMathieu($user->id, $lastTrackId);
                }
            } catch (\Throwable $e) {
                Log::warning('Failed hybrid recommendations', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }

            $recommendedTracks = $this->getTracksFromIds($trackIds);

            if (!empty($recommendedTracks)) {
                Cache::put($cacheKeyRecommended, $recommendedTracks, 4 * 60 * 60);
            }
        }

        return Inertia::render('recommandation/index', [
            'recommendedTracks' => $recommendedTracks,
            'popularTracks' => $popularTracks,
            'lastListenRecommendedTracks' => $lastListenRecommendedTracks,
            'lastListen' => $lastListenFormatted,
        ]);
    }

    // format des tracks depuis leurs ID
    private function getTracksFromIds(array $trackIds): array
    {
        if (empty($trackIds)) {
            return [];
        }

        $tracks = Track::with(['realisers.artist'])
            ->whereIn('track_id', $trackIds)
            ->get();

        return $this->formatTracks($tracks);
    }

    // format des tracks
    private function formatTracks($tracks): array
    {
        return $tracks->map(fn ($track) => [
            'id' => $track->track_id,
            'title' => $track->track_title,
            'cover' => $track->track_image_file,
            'artist' => $track->realisers->first()?->artist,
        ])->toArray();
    }
}
