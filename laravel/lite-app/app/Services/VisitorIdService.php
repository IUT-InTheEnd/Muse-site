<?php

namespace App\Services;

use Illuminate\Contracts\Cookie\QueueingFactory as CookieJar;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VisitorIdService
{
    public const COOKIE_NAME = 'visitor_id';

    private const LIFETIME_MINUTES = 60 * 24 * 365;

    public function __construct(private CookieJar $cookies) {}

    public function current(Request $request): ?string
    {
        $value = $request->cookie(self::COOKIE_NAME);

        return is_string($value) && $value !== '' ? $value : null;
    }

    public function ensure(Request $request): string
    {
        $visitorId = $this->current($request) ?? (string) Str::uuid();

        $this->queue($visitorId);

        return $visitorId;
    }

    public function refreshIfPresent(Request $request): void
    {
        $visitorId = $this->current($request);

        if ($visitorId !== null) {
            $this->queue($visitorId);
        }
    }

    private function queue(string $visitorId): void
    {
        $this->cookies->queue(cookie(
            self::COOKIE_NAME,
            $visitorId,
            self::LIFETIME_MINUTES,
            '/',
            null,
            config('session.secure'),
            true,
            false,
            config('session.same_site', 'lax'),
        ));
    }
}
