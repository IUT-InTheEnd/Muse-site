<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getUser(Request $request)
    {
        return $request->user();
    }

    public function getInfo(Request $request)
    {
        return $request->user()->user_profile;
    }

    public function updateUserInfo(Request $request)
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'user_age' => 'nullable|numeric|between:0,200',
            'user_job' => 'nullable|string|max:255',
            'user_gender' => 'nullable|string|max:255',
            'user_plays_music' => 'nullable|string|max:255',
            'user_instruments' => 'nullable|string|max:1000',
            'user_music_contexts' => 'nullable|string|max:1000',
        ]);

        $user->user_age = $validatedData['user_age'] ?? $user->user_age;
        $user->user_job = $validatedData['user_job'] ?? $user->user_job;
        $user->user_gender = $validatedData['user_gender'] ?? $user->user_gender;
        $user->user_plays_music = $validatedData['user_plays_music'] ?? $user->user_plays_music;
        $user->user_instruments = $validatedData['user_instruments'] ?? $user->user_instruments;
        $user->user_music_contexts = $validatedData['user_music_contexts'] ?? $user->user_music_contexts;
        $user->save();

        return back();
    }

    public function updateUserProfile(Request $request)
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'music_envy_today' => 'nullable|string|max:255',
            'feeling' => 'nullable|integer|between:0,10',
            'music_preference' => 'nullable|integer|between:0,10',
            'music_style_preference' => 'nullable|integer|between:0,10',
            'music_reason' => 'nullable|string|max:255',
            'listening_context' => 'nullable|string|max:255',
            'current_music_type' => 'nullable|integer|between:0,10',
            'usual_listening_mode' => 'nullable|integer|between:0,10',
            'likes_discovery' => 'nullable|integer|between:0,10',
            'attend_live_concert' => 'nullable|integer|between:0,10',
            'repeat_listening' => 'nullable|integer|between:0,10',
            'explicit_ok' => 'nullable|integer|between:0,1',
            'avg_song_length' => 'nullable|numeric|min:0',
            'avg_daily_listen_time' => 'nullable|numeric|min:0',
            'recommanded_artists' => 'nullable|string|max:1000',
        ]);

        $profile = $user->user_profile;

        if (! $profile) {
            $profile = new UserProfile;
            $profile->fill($validatedData);
            $profile->save();

            $user->profile_id = $profile->user_profile_id;
            $user->save();
        } else {
            $profile->fill($validatedData);
            $profile->save();
        }

        return back();
    }
}
