<?php

namespace App\Http\Controllers;

use App\Enums\ListeningContext;
use App\Enums\MusicEnvy;
use App\Enums\MusicReason;
use App\Http\Resources\UserProfileResource;
use App\Rules\ArtistInDB;
use App\Services\UserProfileUpdater;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

#[Group('User')]
class UserProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        return new UserProfileResource($request->user()->user_profile);
    }

    public function updateUserProfile(Request $request, UserProfileUpdater $updater): RedirectResponse
    {
        $this->updateUserProfileApi($request, $updater);

        return redirect()->back(303);
    }

    public function updateUserProfileApi(Request $request, UserProfileUpdater $updater): UserProfileResource
    {
        $validatedData = $request->validate([
            'music_envy_today' => 'nullable|list',
            'music_envy_today.*' => [Rule::enum(MusicEnvy::class)],
            'feeling' => 'nullable|integer|between:0,10',
            'music_preference' => 'nullable|integer|between:0,10',
            'music_style_preference' => 'nullable|integer|between:0,10',
            'music_reason' => 'nullable|list',
            'music_reason.*' => [Rule::enum(MusicReason::class)],
            'listening_context' => 'nullable|list',
            'listening_context.*' => [Rule::enum(ListeningContext::class)],
            'current_music_type' => 'nullable|integer|between:0,10',
            'usual_listening_mode' => 'nullable|integer|between:0,10',
            'likes_discovery' => 'nullable|integer|between:0,10',
            'attend_live_concert' => 'nullable|integer|between:0,10',
            'repeat_listening' => 'nullable|integer|between:0,10',
            'explicit_ok' => 'nullable|boolean',
            'avg_song_length' => 'nullable|numeric|min:0',
            'avg_daily_listen_time' => 'nullable|numeric|min:0',
            'recommanded_artists' => 'nullable|list',
            'recommanded_artists.*' => ['string', new ArtistInDB],
        ]);

        return new UserProfileResource($updater->update($request->user(), $validatedData));
    }
}
