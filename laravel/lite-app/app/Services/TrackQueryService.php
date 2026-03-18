<?php

namespace App\Services;

use App\Models\Track;

class TrackQueryService
{
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
                'artist' => $track->realisers->first()?->artist?->artist_name,
            ])
            ->all();
    }
}
