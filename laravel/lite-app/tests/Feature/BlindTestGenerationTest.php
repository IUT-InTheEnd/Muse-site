<?php

namespace Tests\Feature;

use App\Models\Track;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
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

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateCsrfToken::class);
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
                    'playback' => [
                        'difficulty' => 'dur',
                    ],
                ],
            ])
            ->get('/blind-tests/new')
            ->assertInertia(fn (Assert $page) => $page
                ->component('blind-tests/new')
                ->where('blindTest.has_ephemeral', true)
                ->where('blindTest.ephemeral.track_count', 3)
                ->where('blindTest.playback.difficulty', 'dur')
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
            'playback' => [
                'difficulty' => 'facile',
            ],
            'filters' => [
                'vocal_type' => 'indifferent',
            ],
        ]);

        $response->assertRedirect('/blind-tests/play/ephemeral');
        $response->assertSessionHas('blind_test.ephemeral.track_ids', $tracks->pluck('track_id')->all());
        $response->assertSessionHas('blind_test.playback.difficulty', 'facile');
    }

    public function test_blind_test_lecture_requires_authentication(): void
    {
        $this->get('/blind-tests/lecture')
            ->assertRedirect('/login');
    }

    public function test_authenticated_user_can_fetch_ephemeral_tracks(): void
    {
        $user = User::factory()->create();
        $track = Track::create([
            'track_title' => 'Track lecture',
            'track_file' => 'lecture.mp3',
        ]);

        $this->actingAs($user)
            ->withSession([
                'blind_test' => [
                    'ephemeral' => [
                        'track_ids' => [$track->track_id],
                        'track_count' => 1,
                        'generated_at' => now()->toIso8601String(),
                        'generation' => [],
                    ],
                ],
            ])
            ->getJson('/blind-tests/ephemeral-tracks')
            ->assertOk()
            ->assertJson([
                'tracks' => [[
                    'id' => $track->track_id,
                    'title' => 'Track lecture',
                    'artist' => null,
                    'url' => 'lecture.mp3',
                    'duration' => null,
                ]],
            ]);
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
            'playback' => [
                'difficulty' => 'dur',
            ],
            'filters' => [
                'vocal_type' => 'indifferent',
            ],
        ]);

        $playlistId = DB::table('playlist')
            ->where('user_id', $user->id)
            ->where('playlist_name', 'Blind test persistant')
            ->value('playlist_id');

        $response->assertRedirect("/playlist/{$playlistId}");
        $response->assertSessionHas('blind_test.playback.difficulty', 'dur');

        foreach ($trackIds as $index => $trackId) {
            $this->assertDatabaseHas('playlist_contient_track', [
                'playlist_id' => $playlistId,
                'track_id' => $trackId,
                'position' => $index + 1,
            ]);
        }
    }
}
