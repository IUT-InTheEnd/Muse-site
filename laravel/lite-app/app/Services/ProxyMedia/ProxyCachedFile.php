<?php

namespace App\Services\ProxyMedia;

class ProxyCachedFile
{
    public function __construct(
        public readonly string $absolutePath,
        public readonly string $contentType,
        public readonly string $assetType,
        public readonly bool $deleteAfterSend = false,
    ) {}
}
