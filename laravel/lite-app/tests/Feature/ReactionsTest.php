<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Track;
use App\Models\User;
use App\Services\VisitorIdService;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Tests\TestCase;

class ReactionsTest extends TestCase
{
    use WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('album_reaction');
        Schema::dropIfExists('track_reaction');
        Schema::dropIfExists('album');
        Schema::dropIfExists('track');
        Schema::dropIfExists('user');

        Schema::create('user', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('remember_token', 100)->nullable();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('track', function (Blueprint $table) {
            $table->increments('track_id');
            $table->string('track_title')->nullable();
            $table->unsignedInteger('track_listens')->default(0);
            $table->unsignedInteger('track_favorites')->default(0);
            $table->unsignedInteger('track_likes')->default(0);
            $table->unsignedInteger('track_dislikes')->default(0);
            $table->unsignedInteger('track_duration')->nullable();
            $table->string('track_image_file')->nullable();
            $table->string('track_file')->nullable();
        });

        Schema::create('album', function (Blueprint $table) {
            $table->increments('album_id');
            $table->string('album_title');
            $table->date('album_date_created')->nullable();
            $table->unsignedInteger('album_listens')->default(0);
            $table->unsignedInteger('album_favorites')->default(0);
            $table->unsignedInteger('album_likes')->default(0);
            $table->unsignedInteger('album_dislikes')->default(0);
            $table->string('album_image_file')->nullable();
        });

        Schema::create('track_reaction', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('track_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->uuid('visitor_id')->nullable();
            $table->string('reaction', 16);
            $table->timestamps();
        });

        Schema::create('album_reaction', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('album_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->uuid('visitor_id')->nullable();
            $table->string('reaction', 16);
            $table->timestamps();
        });
    }

    public function test_guest_can_like_a_track_and_receives_a_visitor_cookie(): void
    {
        $track = Track::create(['track_title' => 'Track test']);

        $response = $this->postJson(route('reactions.tracks.react', $track), [
            'reaction' => 'like',
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'reaction' => 'like',
                'likes' => 1,
                'dislikes' => 0,
            ])
            ->assertCookie(VisitorIdService::COOKIE_NAME);

        $this->assertDatabaseHas('track_reaction', [
            'track_id' => $track->track_id,
            'reaction' => 'like',
        ]);

        $this->assertSame(1, Track::find($track->track_id)?->track_likes);
        $this->assertSame(0, Track::find($track->track_id)?->track_dislikes);
    }

    public function test_guest_can_switch_track_reaction_from_like_to_dislike(): void
    {
        $track = Track::create(['track_title' => 'Track test']);
        $visitorId = 'e5362a54-4a12-4ea8-8dad-dfbad7900123';

        DB::table('track_reaction')->insert([
            'track_id' => $track->track_id,
            'visitor_id' => $visitorId,
            'reaction' => 'like',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $track->update([
            'track_likes' => 1,
            'track_dislikes' => 0,
        ]);

        $response = $this
            ->withCookie(VisitorIdService::COOKIE_NAME, $visitorId)
            ->postJson(route('reactions.tracks.react', $track), [
                'reaction' => 'dislike',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'reaction' => 'dislike',
                'likes' => 0,
                'dislikes' => 1,
            ]);

        $this->assertSame(
            'dislike',
            DB::table('track_reaction')->where('track_id', $track->track_id)->value('reaction'),
        );
    }

    public function test_authenticated_reaction_is_attached_to_the_account_and_does_not_issue_guest_cookie(): void
    {
        $user = User::create([
            'name' => 'alice',
            'email' => 'alice@example.test',
            'password' => bcrypt('password'),
        ]);
        $album = Album::create(['album_title' => 'Album test']);

        $response = $this
            ->actingAs($user)
            ->postJson(route('reactions.albums.react', $album), [
                'reaction' => 'like',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'reaction' => 'like',
                'likes' => 1,
                'dislikes' => 0,
            ]);

        $this->assertDatabaseHas('album_reaction', [
            'album_id' => $album->album_id,
            'user_id' => $user->id,
            'reaction' => 'like',
        ]);

        $this->assertNull(
            DB::table('album_reaction')->where('album_id', $album->album_id)->value('visitor_id'),
        );
    }

    public function test_same_reaction_can_be_removed_by_sending_it_again(): void
    {
        $album = Album::create(['album_title' => 'Album test']);
        $visitorId = 'ed655eeb-7c64-4c68-84c8-bc7fa67f0a6f';

        DB::table('album_reaction')->insert([
            'album_id' => $album->album_id,
            'visitor_id' => $visitorId,
            'reaction' => 'dislike',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $album->update([
            'album_likes' => 0,
            'album_dislikes' => 1,
        ]);

        $response = $this
            ->withCookie(VisitorIdService::COOKIE_NAME, $visitorId)
            ->postJson(route('reactions.albums.react', $album), [
                'reaction' => 'none',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'reaction' => null,
                'likes' => 0,
                'dislikes' => 0,
            ]);

        $this->assertDatabaseMissing('album_reaction', [
            'album_id' => $album->album_id,
            'visitor_id' => $visitorId,
        ]);
    }
}
