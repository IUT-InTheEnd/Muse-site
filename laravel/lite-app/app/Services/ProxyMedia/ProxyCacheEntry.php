<?php

namespace App\Services\ProxyMedia;

use Carbon\CarbonImmutable;

class ProxyCacheEntry
{
    public function __construct(
        public readonly string $hash,
        public readonly string $sourceUrl,
        public readonly string $disk,
        public readonly string $path,
        public readonly int $sizeBytes,
        public readonly string $contentType,
        public readonly string $assetType,
        public readonly CarbonImmutable $lastAccessedAt,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            hash: (string) $payload['hash'],
            sourceUrl: (string) $payload['source_url'],
            disk: (string) $payload['disk'],
            path: (string) $payload['path'],
            sizeBytes: (int) $payload['size_bytes'],
            contentType: (string) $payload['content_type'],
            assetType: (string) $payload['asset_type'],
            lastAccessedAt: CarbonImmutable::parse($payload['last_accessed_at']),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'hash' => $this->hash,
            'source_url' => $this->sourceUrl,
            'disk' => $this->disk,
            'path' => $this->path,
            'size_bytes' => $this->sizeBytes,
            'content_type' => $this->contentType,
            'asset_type' => $this->assetType,
            'last_accessed_at' => $this->lastAccessedAt->toIso8601String(),
        ];
    }

    public function touch(CarbonImmutable $timestamp): self
    {
        return new self(
            hash: $this->hash,
            sourceUrl: $this->sourceUrl,
            disk: $this->disk,
            path: $this->path,
            sizeBytes: $this->sizeBytes,
            contentType: $this->contentType,
            assetType: $this->assetType,
            lastAccessedAt: $timestamp,
        );
    }
}
