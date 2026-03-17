<?php

namespace App\Http\Middleware;

use App\Services\VisitorIdService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RefreshVisitorCookie
{
    public function __construct(private VisitorIdService $visitorIds) {}

    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if ($request->user() === null) {
            $this->visitorIds->refreshIfPresent($request);
        }

        return $response;
    }
}
