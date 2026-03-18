<?php

namespace Tests\Feature;

use App\Services\ProxyMedia\ProxyCachedFile;
use App\Services\ProxyMedia\ProxyMediaCacheService;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use Tests\TestCase;

class ProxyControllerTest extends TestCase
{
    public function test_it_returns_the_image_placeholder_for_invalid_urls(): void
    {
        $this->get(route('proxy', ['url' => 'not-a-valid-url']))
            ->assertOk()
            ->assertHeader('content-type', 'image/png');
    }

    public function test_it_serves_a_cached_audio_file_from_local_storage(): void
    {
        Storage::disk('local')->put('tests/proxy/sample.mp3', 'fake-audio-content');

        $path = Storage::disk('local')->path('tests/proxy/sample.mp3');

        $this->mock(ProxyMediaCacheService::class, function (MockInterface $mock) use ($path) {
            $mock->shouldReceive('getOrFetch')
                ->once()
                ->with('https://files.freemusicarchive.org/track.mp3')
                ->andReturn(new ProxyCachedFile($path, 'audio/mpeg', 'audio'));
        });

        $this->get(route('proxy', ['url' => 'https://files.freemusicarchive.org/track.mp3']))
            ->assertOk()
            ->assertHeader('content-type', 'audio/mpeg')
            ->assertHeader('accept-ranges', 'bytes');
    }

    public function test_it_falls_back_to_the_audio_placeholder_when_the_cache_service_cannot_resolve_the_file(): void
    {
        $this->mock(ProxyMediaCacheService::class, function (MockInterface $mock) {
            $mock->shouldReceive('getOrFetch')
                ->once()
                ->with('https://files.freemusicarchive.org/track.mp3')
                ->andReturnNull();
        });

        $this->get(route('proxy', ['url' => 'https://files.freemusicarchive.org/track.mp3']))
            ->assertOk()
            ->assertHeader('content-type', 'audio/mpeg');
    }
}
