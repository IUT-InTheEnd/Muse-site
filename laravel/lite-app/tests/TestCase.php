<?php

namespace Tests;

use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        DB::beginTransaction();

        $this->beforeApplicationDestroyed(function (): void {
            while (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
        });
    }
}
