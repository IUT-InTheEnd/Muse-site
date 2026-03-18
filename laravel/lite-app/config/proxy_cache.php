<?php

return [
    'metadata_store' => env('PROXY_CACHE_METADATA_STORE', 'redis'),
    'redis_connection' => env('PROXY_CACHE_REDIS_CONNECTION', env('REDIS_CACHE_CONNECTION', 'cache')),
    'disk' => env('PROXY_CACHE_DISK', 'local'),
    'directory' => env('PROXY_CACHE_DIRECTORY', 'proxy-cache'),
    'max_size_bytes' => (int) env('PROXY_CACHE_MAX_SIZE_BYTES', 5 * 1024 * 1024 * 1024),
    'max_file_size_bytes' => (int) env('PROXY_CACHE_MAX_FILE_SIZE_BYTES', 50 * 1024 * 1024),
    'download_timeout_seconds' => (int) env('PROXY_CACHE_DOWNLOAD_TIMEOUT_SECONDS', 60),
    'lock_seconds' => (int) env('PROXY_CACHE_LOCK_SECONDS', 120),
    'lock_wait_seconds' => (int) env('PROXY_CACHE_LOCK_WAIT_SECONDS', 10),
    'eviction_batch_size' => (int) env('PROXY_CACHE_EVICTION_BATCH_SIZE', 25),
];
