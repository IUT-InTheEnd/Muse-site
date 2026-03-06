<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;

class UseApiDatabase
{
    public function handle($request, Closure $next)
    {
        DB::setDefaultConnection('pgsql_api');

        return $next($request);
    }
}
