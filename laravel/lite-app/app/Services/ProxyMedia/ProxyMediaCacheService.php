<?php

namespace App\Services\ProxyMedia;

use App\Services\ProxyMedia\Contracts\ProxyCacheIndex;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ProxyMediaCacheService
{
    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    /**
     * @var array<string>
     */
    private array $allowedContentTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    public function __construct(
        private readonly ProxyCacheIndex $index,
    ) {}

    public function getOrFetch(string $url): ?ProxyCachedFile
    {
        $hash = sha1($url);

        if ($cached = $this->findCached($hash)) {
            return $cached;
        }

        $lock = $this->index->lock("download:{$hash}", (int) config('proxy_cache.lock_seconds', 120));

        return $lock->block((int) config('proxy_cache.lock_wait_seconds', 10), function () use ($hash, $url) {
            if ($cached = $this->findCached($hash)) {
                return $cached;
            }

            return $this->downloadAndStore($hash, $url);
        });
    }

    private function findCached(string $hash): ?ProxyCachedFile
    {
        $entry = $this->index->find($hash);
        if ($entry === null) {
            return null;
        }

        $disk = Storage::disk($entry->disk);
        if (! $disk->exists($entry->path)) {
            $this->index->remove($entry);

            return null;
        }

        $entry = $this->index->touch($entry);

        return new ProxyCachedFile(
            absolutePath: $disk->path($entry->path),
            contentType: $entry->contentType,
            assetType: $entry->assetType,
        );
    }

    private function downloadAndStore(string $hash, string $url): ?ProxyCachedFile
    {
        $diskName = (string) config('proxy_cache.disk', 'local');
        $disk = Storage::disk($diskName);

        $tempRelativePath = $this->temporaryRelativePath($hash);
        $this->ensureDirectoryExists(dirname($tempRelativePath));
        $tempAbsolutePath = $disk->path($tempRelativePath);

        $response = $this->downloadTo($url, $tempAbsolutePath);
        if (! $response->successful()) {
            $disk->delete($tempRelativePath);

            return null;
        }

        $contentType = $this->normalizeContentType($response);
        if ($contentType === null || ! in_array($contentType, $this->allowedContentTypes, true)) {
            $disk->delete($tempRelativePath);

            return null;
        }

        clearstatcache(true, $tempAbsolutePath);
        $sizeBytes = filesize($tempAbsolutePath);

        if ($sizeBytes === false || $sizeBytes <= 0) {
            $disk->delete($tempRelativePath);

            return null;
        }

        $assetType = $this->guessTypeFromContentType($contentType);
        if ($sizeBytes > (int) config('proxy_cache.max_file_size_bytes', 50 * 1024 * 1024)) {
            return new ProxyCachedFile(
                absolutePath: $tempAbsolutePath,
                contentType: $contentType,
                assetType: $assetType,
                deleteAfterSend: true,
            );
        }

        $finalRelativePath = $this->cachedRelativePath($hash, $assetType, $contentType);
        $this->ensureDirectoryExists(dirname($finalRelativePath));
        $disk->move($tempRelativePath, $finalRelativePath);

        $entry = new ProxyCacheEntry(
            hash: $hash,
            sourceUrl: $url,
            disk: $diskName,
            path: $finalRelativePath,
            sizeBytes: $sizeBytes,
            contentType: $contentType,
            assetType: $assetType,
            lastAccessedAt: now()->toImmutable(),
        );

        $this->index->put($entry);
        $this->evictIfNeeded();

        return new ProxyCachedFile(
            absolutePath: $disk->path($finalRelativePath),
            contentType: $contentType,
            assetType: $assetType,
        );
    }

    private function evictIfNeeded(): void
    {
        $maxSizeBytes = (int) config('proxy_cache.max_size_bytes', 5 * 1024 * 1024 * 1024);
        if ($this->index->totalSize() <= $maxSizeBytes) {
            return;
        }

        $lock = $this->index->lock('eviction', (int) config('proxy_cache.lock_seconds', 120));

        $lock->block((int) config('proxy_cache.lock_wait_seconds', 10), function () use ($maxSizeBytes) {
            $disk = Storage::disk((string) config('proxy_cache.disk', 'local'));
            $batchSize = (int) config('proxy_cache.eviction_batch_size', 25);

            while ($this->index->totalSize() > $maxSizeBytes) {
                $hashes = $this->index->oldestHashes($batchSize);
                if ($hashes === []) {
                    break;
                }

                foreach ($hashes as $hash) {
                    $entry = $this->index->find($hash);

                    if ($entry === null) {
                        $this->index->purgeHash($hash);

                        continue;
                    }

                    $disk->delete($entry->path);
                    $this->index->remove($entry);

                    if ($this->index->totalSize() <= $maxSizeBytes) {
                        break;
                    }
                }
            }
        });
    }

    private function downloadTo(string $url, string $destination): Response
    {
        return Http::withHeaders([
            'User-Agent' => self::USER_AGENT,
        ])->timeout((int) config('proxy_cache.download_timeout_seconds', 60))
            ->withOptions(['sink' => $destination])
            ->get($url);
    }

    private function normalizeContentType(Response $response): ?string
    {
        $header = $response->header('Content-Type');
        if (! is_string($header) || $header === '') {
            return null;
        }

        return strtolower(trim(explode(';', $header)[0]));
    }

    private function guessTypeFromContentType(string $contentType): string
    {
        return str_starts_with($contentType, 'audio/') ? 'audio' : 'image';
    }

    private function cachedRelativePath(string $hash, string $assetType, string $contentType): string
    {
        $directory = trim((string) config('proxy_cache.directory', 'proxy-cache'), '/');
        $extension = $this->extensionForContentType($contentType);

        return "{$directory}/{$assetType}/{$hash}.{$extension}";
    }

    private function temporaryRelativePath(string $hash): string
    {
        $directory = trim((string) config('proxy_cache.directory', 'proxy-cache'), '/');

        return "{$directory}/tmp/{$hash}-".bin2hex(random_bytes(5)).'.tmp';
    }

    private function extensionForContentType(string $contentType): string
    {
        return match ($contentType) {
            'audio/mpeg' => 'mp3',
            'audio/wav' => 'wav',
            'audio/ogg' => 'ogg',
            'audio/mp4' => 'm4a',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => throw new RuntimeException("Unsupported content type [{$contentType}]"),
        };
    }

    private function ensureDirectoryExists(string $relativeDirectory): void
    {
        if ($relativeDirectory === '.' || $relativeDirectory === '') {
            return;
        }

        Storage::disk((string) config('proxy_cache.disk', 'local'))->makeDirectory($relativeDirectory);
    }
}
