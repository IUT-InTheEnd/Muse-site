<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all unique user IDs that have favorites
        $userIds = DB::table('ajoute_favori')
            ->distinct()
            ->pluck('user_id');

        foreach ($userIds as $userId) {
            // Check if user exists
            $userExists = DB::table('user')->where('id', $userId)->exists();
            if (! $userExists) {
                continue;
            }

            // Get or create the "Favoris" playlist for this user
            $playlist = DB::table('playlist')
                ->where('user_id', $userId)
                ->where('playlist_deletable', false)
                ->where('playlist_name', 'Favoris')
                ->first();

            if (! $playlist) {
                $playlistId = DB::table('playlist')->insertGetId([
                    'user_id' => $userId,
                    'playlist_name' => 'Favoris',
                    'playlist_description' => 'Vos titres favoris',
                    'playlist_date_created' => now(),
                    'playlist_date_updated' => now(),
                    'playlist_public' => false,
                    'playlist_deletable' => false,
                ], 'playlist_id');
            } else {
                $playlistId = $playlist->playlist_id;
            }

            // Get all favorite track IDs for this user
            $favoriteTrackIds = DB::table('ajoute_favori')
                ->where('user_id', $userId)
                ->pluck('track_id');

            // Get existing track IDs in the playlist to avoid duplicates
            $existingTrackIds = DB::table('playlist_contient_track')
                ->where('playlist_id', $playlistId)
                ->pluck('track_id')
                ->toArray();

            // Insert only non-duplicate tracks
            $tracksToInsert = [];
            foreach ($favoriteTrackIds as $trackId) {
                if (! in_array($trackId, $existingTrackIds)) {
                    $tracksToInsert[] = [
                        'playlist_id' => $playlistId,
                        'track_id' => $trackId,
                    ];
                }
            }

            if (! empty($tracksToInsert)) {
                DB::table('playlist_contient_track')->insert($tracksToInsert);

                // Update playlist date
                DB::table('playlist')
                    ->where('playlist_id', $playlistId)
                    ->update(['playlist_date_updated' => now()]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get all "Favoris" playlists that are non-deletable
        $playlists = DB::table('playlist')
            ->where('playlist_deletable', false)
            ->where('playlist_name', 'Favoris')
            ->get();

        foreach ($playlists as $playlist) {
            // Get track IDs from ajoute_favori for this user
            $originalFavoriteIds = DB::table('ajoute_favori')
                ->where('user_id', $playlist->user_id)
                ->pluck('track_id')
                ->toArray();

            // Remove only tracks that came from ajoute_favori
            DB::table('playlist_contient_track')
                ->where('playlist_id', $playlist->playlist_id)
                ->whereIn('track_id', $originalFavoriteIds)
                ->delete();
        }
    }
};
