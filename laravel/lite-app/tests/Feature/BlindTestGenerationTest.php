<?php

namespace Tests\Feature;

use App\Models\Track;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use Tests\TestCase;

class BlindTestGenerationTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_generation_page_receives_shared_blind_test_session_state(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession([
                'blind_test' => [
                    'ephemeral' => [
                        'track_ids' => [11, 12, 13],
                        'track_count' => 3,
                        'generated_at' => now()->toIso8601String(),
                        'generation' => [
                            'count' => 3,
                        ],
                    ],
                ],
            ])
            ->get('/blind-tests/new')
            ->assertInertia(fn (Assert $page) => $page
                ->component('blind-tests/new')
                ->where('blindTest.has_ephemeral', true)
                ->where('blindTest.ephemeral.track_count', 3)
            );
    }

    public function test_generation_without_saving_stores_an_ephemeral_session(): void
    {
        $user = User::factory()->create();
        $tracks = collect(range(1, 3))->map(fn (int $index) => Track::create([
            'track_title' => "Track blind {$index}",
            'track_file' => "blind-{$index}.mp3",
        ]));

        $mock = Mockery::mock(RecommendationService::class);
        $mock->shouldReceive('generateBlindTest')
            ->once()
            ->andReturn([
                'track_ids' => $tracks->pluck('track_id')->all(),
                'counts' => [
                    'requested' => 3,
                    'known_selected' => 1,
                    'unknown_selected' => 2,
                ],
            ]);
        $this->app->instance(RecommendationService::class, $mock);

        $response = $this->actingAs($user)->post('/blind-tests/generate', [
            'count' => 3,
            'save_playlist' => false,
            'filters' => [
                'vocal_type' => 'indifferent',
            ],
        ]);

        $response->assertRedirect('/blind-tests/play/ephemeral');
        $response->assertSessionHas('blind_test.ephemeral.track_ids', $tracks->pluck('track_id')->all());
    }

    public function test_generation_with_save_creates_an_ordered_playlist(): void
    {
        $user = User::factory()->create();
        $tracks = collect(range(1, 4))->map(fn (int $index) => Track::create([
            'track_title' => "Track save {$index}",
            'track_file' => "save-{$index}.mp3",
        ]));
        $trackIds = $tracks->pluck('track_id')->all();

        $mock = Mockery::mock(RecommendationService::class);
        $mock->shouldReceive('generateBlindTest')
            ->once()
            ->andReturn([
                'track_ids' => $trackIds,
                'counts' => [
                    'requested' => 4,
                    'known_selected' => 2,
                    'unknown_selected' => 2,
                ],
            ]);
        $this->app->instance(RecommendationService::class, $mock);

        $response = $this->actingAs($user)->post('/blind-tests/generate', [
            'count' => 4,
            'save_playlist' => true,
            'playlist_name' => 'Blind test persistant',
            'filters' => [
                'vocal_type' => 'indifferent',
            ],
        ]);

        $playlistId = DB::table('playlist')
            ->where('user_id', $user->id)
            ->where('playlist_name', 'Blind test persistant')
            ->value('playlist_id');

        $response->assertRedirect("/playlist/{$playlistId}");

        foreach ($trackIds as $index => $trackId) {
            $this->assertDatabaseHas('playlist_contient_track', [
                'playlist_id' => $playlistId,
                'track_id' => $trackId,
                'position' => $index + 1,
            ]);
        }
    }
}
