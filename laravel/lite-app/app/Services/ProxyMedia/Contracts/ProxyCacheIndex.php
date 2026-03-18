<?php

namespace App\Services\ProxyMedia\Contracts;

use App\Services\ProxyMedia\ProxyCacheEntry;
use Illuminate\Contracts\Cache\Lock;

interface ProxyCacheIndex
{
    public function find(string $hash): ?ProxyCacheEntry;

    public function put(ProxyCacheEntry $entry): void;

    public function touch(ProxyCacheEntry $entry): ProxyCacheEntry;

    public function remove(ProxyCacheEntry $entry): void;

    public function purgeHash(string $hash): void;

    public function totalSize(): int;

    /**
     * @return list<string>
     */
    public function oldestHashes(int $limit): array;

    public function lock(string $name, int $seconds): Lock;
}
