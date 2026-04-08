<?php

namespace App\Jobs;

use App\Services\RecommendationCacheService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RefreshUserRecommendations implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $timeout = 300;

    public function __construct(
        public int $userId,
    ) {}

    public function handle(RecommendationCacheService $recommendationCache): void
    {
        $recommendationCache->refreshUserRecommendations($this->userId);
    }
}
