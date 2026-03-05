<?php

use App\Models\Playlist;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates a "Favoris" playlist for all existing users who don't have one.
     */
    public function up(): void
    {
        // Get all user IDs that don't have a favorites playlist yet
        $usersWithoutFavorites = User::whereNotExists(function ($query) {
            $query->select(DB::raw(1))
                ->from('playlist')
                ->whereColumn('playlist.user_id', 'user.id')
                ->where('playlist.playlist_deletable', false)
                ->where('playlist.playlist_name', 'Favoris');
        })->pluck('id');

        // Create favorites playlist for each user
        $now = now();
        $playlists = $usersWithoutFavorites->map(function ($userId) use ($now) {
            return [
                'user_id' => $userId,
                'playlist_name' => 'Favoris',
                'playlist_description' => 'Vos titres favoris',
                'playlist_date_created' => $now,
                'playlist_date_updated' => $now,
                'playlist_public' => false,
                'playlist_deletable' => false,
            ];
        })->toArray();

        // Insert in chunks to avoid memory issues with large user bases
        foreach (array_chunk($playlists, 500) as $chunk) {
            Playlist::insert($chunk);
        }
    }

    /**
     * Reverse the migrations.
     * Removes the auto-created "Favoris" playlists (only if empty).
     */
    public function down(): void
    {
        // Only delete favorites playlists that are empty (no tracks)
        // to avoid data loss
        Playlist::where('playlist_deletable', false)
            ->where('playlist_name', 'Favoris')
            ->whereDoesntHave('tracks')
            ->delete();
    }
};
