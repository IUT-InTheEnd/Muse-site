<?php

namespace App\Services;

use App\Models\Track;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TrackQueryService
{
    public function __construct(
        private RecommendationService $recommendations,
    ) {}

    public function newTracks(int $limit = 10): array
    {
        return Track::with(['realisers.artist'])
            ->whereNotNull('track_date_created')
            ->orderBy('track_date_created', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($track) => [
                'id' => $track->track_id,
                'title' => $track->track_title,
                'cover' => $track->track_image_file,
                'artist' => $track->realisers->first()?->artist,
            ])
            ->all();
    }

    public function guestRecommendedTracks(int $limit = 10): array
    {
        $cacheKey = "guest_welcome_recommendation_{$limit}";
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            return $cached;
        }

        try {
            $trackIds = $this->recommendations->newUser($limit);
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

        if ($tracks !== []) {
            Cache::put($cacheKey, $tracks, 4 * 60 * 60);
        }

        return $tracks;
    }
}
