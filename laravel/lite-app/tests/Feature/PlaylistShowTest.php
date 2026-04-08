<?php

namespace Tests\Feature;

use App\Models\Playlist;
use App\Models\Track;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlaylistShowTest extends TestCase
{
    public function test_playlist_show_includes_track_reaction_state_for_the_viewer(): void
    {
        $user = User::factory()->create();
        $playlist = Playlist::create([
            'user_id' => $user->id,
            'playlist_name' => 'Playlist test',
            'playlist_deletable' => true,
            'playlist_public' => true,
        ]);
        $track = Track::create([
            'track_title' => 'Track test',
            'track_likes' => 5,
            'track_dislikes' => 2,
        ]);

        DB::table('playlist_contient_track')->insert([
            'playlist_id' => $playlist->playlist_id,
            'track_id' => $track->track_id,
            'position' => 0,
        ]);

        DB::table('track_reaction')->insert([
            'track_id' => $track->track_id,
            'user_id' => $user->id,
            'reaction' => 'like',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('playlist.show', ['id' => $playlist->playlist_id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('playlist/show')
                ->where('playlist.tracks.0.track_id', $track->track_id)
                ->where('playlist.tracks.0.track_likes', 5)
                ->where('playlist.tracks.0.track_dislikes', 2)
                ->where('playlist.tracks.0.viewer_reaction', 'like')
            );
    }
}
