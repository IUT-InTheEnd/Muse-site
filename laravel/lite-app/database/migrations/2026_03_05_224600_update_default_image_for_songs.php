<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('track', function (Blueprint $table) {
            DB::table('track')
                ->whereNull('track_image_file')
                ->orWhere('track_image_file', '')
                ->update(['track_image_file' => DB::raw('(SELECT album.album_image_file FROM album JOIN realiser ON album.album_id = realiser.album_id WHERE realiser.track_id = track.track_id LIMIT 1)')]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('track', function (Blueprint $table) {
            //
        });
    }
};
