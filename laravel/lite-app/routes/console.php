<?php

use App\Models\UserEcoute;
use App\Services\RecommendationCacheService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('recommendations:warm {--hours=24} {--limit=100}', function (RecommendationCacheService $recommendationCache) {
    $hours = max((int) $this->option('hours'), 1);
    $limit = max((int) $this->option('limit'), 1);

    $userIds = UserEcoute::query()
        ->select('user_id')
        ->where('last_listen', '>=', now()->subHours($hours))
        ->groupBy('user_id')
        ->orderByRaw('MAX(last_listen) DESC')
        ->limit($limit)
        ->pluck('user_id');

    $queued = 0;

    foreach ($userIds as $userId) {
        if ($recommendationCache->dispatchRefresh((int) $userId)) {
            $queued++;
        }
    }

    $this->info("Queued {$queued} recommendation refresh jobs for {$userIds->count()} active users.");
})->purpose('Queue recommendation refresh jobs for recently active users');
