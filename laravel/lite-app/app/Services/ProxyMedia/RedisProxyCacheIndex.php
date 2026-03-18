<?php

namespace App\Services\ProxyMedia;

use App\Services\ProxyMedia\Contracts\ProxyCacheIndex;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Cache\Factory as CacheFactory;
use Illuminate\Contracts\Cache\Lock;
use Illuminate\Redis\RedisManager;

class RedisProxyCacheIndex implements ProxyCacheIndex
{
    public function __construct(
        private readonly CacheFactory $cache,
        private readonly RedisManager $redis,
    ) {}

    public function find(string $hash): ?ProxyCacheEntry
    {
        $payload = $this->store()->get($this->metadataKey($hash));

        if (! is_array($payload)) {
            return null;
        }

        return ProxyCacheEntry::fromArray($payload);
    }

    public function put(ProxyCacheEntry $entry): void
    {
        $existing = $this->find($entry->hash);
        if ($existing !== null) {
            $this->remove($existing);
        }

        $this->store()->forever($this->metadataKey($entry->hash), $entry->toArray());
        $this->redis()->zadd($this->lruKey(), $entry->lastAccessedAt->getTimestamp(), $entry->hash);
        $this->redis()->incrby($this->totalSizeKey(), $entry->sizeBytes);
    }

    public function touch(ProxyCacheEntry $entry): ProxyCacheEntry
    {
        $updated = $entry->touch(CarbonImmutable::now());

        $this->store()->forever($this->metadataKey($updated->hash), $updated->toArray());
        $this->redis()->zadd($this->lruKey(), $updated->lastAccessedAt->getTimestamp(), $updated->hash);

        return $updated;
    }

    public function remove(ProxyCacheEntry $entry): void
    {
        $this->store()->forget($this->metadataKey($entry->hash));
        $this->redis()->zrem($this->lruKey(), $entry->hash);
        $this->redis()->decrby($this->totalSizeKey(), $entry->sizeBytes);

        if ($this->totalSize() < 0) {
            $this->redis()->set($this->totalSizeKey(), 0);
        }
    }

    public function purgeHash(string $hash): void
    {
        $entry = $this->find($hash);

        if ($entry !== null) {
            $this->remove($entry);

            return;
        }

        $this->store()->forget($this->metadataKey($hash));
        $this->redis()->zrem($this->lruKey(), $hash);
    }

    public function totalSize(): int
    {
        return (int) ($this->redis()->get($this->totalSizeKey()) ?? 0);
    }

    public function oldestHashes(int $limit): array
    {
        $hashes = $this->redis()->zrange($this->lruKey(), 0, max(0, $limit - 1));

        if (! is_array($hashes)) {
            return [];
        }

        return array_values(array_map('strval', $hashes));
    }

    public function lock(string $name, int $seconds): Lock
    {
        return $this->store()->lock($this->lockKey($name), $seconds);
    }

    private function store()
    {
        return $this->cache->store(config('proxy_cache.metadata_store', 'redis'));
    }

    private function redis()
    {
        return $this->redis->connection(config('proxy_cache.redis_connection', 'cache'));
    }

    private function metadataKey(string $hash): string
    {
        return "proxy:meta:{$hash}";
    }

    private function lruKey(): string
    {
        return 'proxy:lru';
    }

    private function totalSizeKey(): string
    {
        return 'proxy:total_size';
    }

    private function lockKey(string $name): string
    {
        return "proxy:lock:{$name}";
    }
}
