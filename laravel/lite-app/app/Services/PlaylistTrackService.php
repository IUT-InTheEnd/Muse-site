<?php

namespace App\Services;

use App\Models\Playlist;
use Illuminate\Support\Facades\DB;

class PlaylistTrackService
{
    public function appendTrack(Playlist $playlist, int $trackId): void
    {
        $this->appendTracks($playlist, [$trackId]);
    }

    public function appendTracks(Playlist $playlist, array $trackIds): void
    {
        $trackIds = array_values(array_unique(array_map('intval', $trackIds)));

        if ($trackIds === []) {
            return;
        }

        $existingTrackIds = DB::table('playlist_contient_track')
            ->where('playlist_id', $playlist->playlist_id)
            ->pluck('track_id')
            ->map(fn ($trackId) => (int) $trackId)
            ->all();

        $newTrackIds = array_values(array_diff($trackIds, $existingTrackIds));

        if ($newTrackIds === []) {
            return;
        }

        $nextPosition = $this->nextPosition($playlist);
        $payload = [];

        foreach ($newTrackIds as $offset => $trackId) {
            $payload[$trackId] = [
                'position' => $nextPosition + $offset,
            ];
        }

        $playlist->tracks()->attach($payload);
        $this->touchPlaylist($playlist);
    }

    public function removeTrack(Playlist $playlist, int $trackId): void
    {
        $playlist->tracks()->detach($trackId);
        $this->normalizePositions($playlist);
        $this->touchPlaylist($playlist);
    }

    public function reorderTracks(Playlist $playlist, array $orderedTrackIds): void
    {
        $orderedTrackIds = array_values(array_unique(array_map('intval', $orderedTrackIds)));

        if ($orderedTrackIds === []) {
            return;
        }

        $existingTrackIds = DB::table('playlist_contient_track')
            ->where('playlist_id', $playlist->playlist_id)
            ->orderBy('position')
            ->pluck('track_id')
            ->map(fn ($trackId) => (int) $trackId)
            ->all();

        if ($existingTrackIds === []) {
            return;
        }

        $unknownTrackIds = array_diff($orderedTrackIds, $existingTrackIds);
        if ($unknownTrackIds !== []) {
            throw new \InvalidArgumentException('La liste de réordonnancement contient des titres inconnus.');
        }

        $missingTrackIds = array_values(array_diff($existingTrackIds, $orderedTrackIds));
        $finalOrder = array_merge($orderedTrackIds, $missingTrackIds);

        $syncPayload = [];
        foreach ($finalOrder as $index => $trackId) {
            $syncPayload[$trackId] = [
                'position' => $index + 1,
            ];
        }

        $playlist->tracks()->syncWithoutDetaching($syncPayload);
        $this->touchPlaylist($playlist);
    }

    public function normalizePositions(Playlist $playlist): void
    {
        $trackIds = DB::table('playlist_contient_track')
            ->where('playlist_id', $playlist->playlist_id)
            ->orderBy('position')
            ->pluck('track_id')
            ->map(fn ($trackId) => (int) $trackId)
            ->all();

        if ($trackIds === []) {
            return;
        }

        $syncPayload = [];
        foreach ($trackIds as $index => $trackId) {
            $syncPayload[$trackId] = [
                'position' => $index + 1,
            ];
        }

        $playlist->tracks()->syncWithoutDetaching($syncPayload);
    }

    private function nextPosition(Playlist $playlist): int
    {
        $maxPosition = DB::table('playlist_contient_track')
            ->where('playlist_id', $playlist->playlist_id)
            ->max('position');

        return ((int) $maxPosition) + 1;
    }

    private function touchPlaylist(Playlist $playlist): void
    {
        $playlist->playlist_date_updated = now();
        $playlist->save();
    }
}
