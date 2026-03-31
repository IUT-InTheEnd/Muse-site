<?php

namespace App\Http\Middleware;

use App\Services\BlindTestSessionService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShareBlindTestSession
{
    public function __construct(private BlindTestSessionService $blindTests) {}

    public function handle(Request $request, Closure $next)
    {
        Inertia::share('blindTest', fn () => $this->blindTests->sharedData($request->session()));

        return $next($request);
    }
}
