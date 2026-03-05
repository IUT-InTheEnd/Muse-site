<?php

namespace App\Http\Controllers;

use App\Enums\ListeningContext;
use App\Enums\MusicEnvy;
use App\Enums\MusicReason;
use App\Http\Resources\UserProfileResource;
use App\Models\UserProfile;
use App\Rules\ArtistInDB;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

#[Group('User')]
class UserProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        return new UserProfileResource($request->user()->user_profile);
    }

    public function updateUserProfile(Request $request)
    {
        $user = auth()->user();

//        $request->

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
            // Artist must be in the database.
            'recommanded_artists' => 'nullable|list',
            'recommanded_artists.*' => ['string', new ArtistInDB],
        ]);

        foreach (['music_envy_today', 'music_reason', 'listening_context', 'recommanded_artists'] as $field) {
            if (! array_key_exists($field, $validatedData)) {
                $validatedData[$field] = null;
            }
        }


        $stringify = function (string $s): string {
            return "'".$s."'";
        };

        function compactList($list, $stringfc)
        {
            if (! is_null($list)) {
                return '['.implode(', ', array_map($stringfc, $list)).']';
            }

            return null;
        }

        $finalData = $validatedData;

        $finalData['music_envy_today'] = compactList($validatedData['music_envy_today'], $stringify);
        $finalData['music_reason'] = compactList($validatedData['music_reason'], $stringify);
        $finalData['listening_context'] = compactList($validatedData['listening_context'], $stringify);
        $finalData['recommanded_artists'] = compactList($validatedData['recommanded_artists'], $stringify);

        $profile = $user->user_profile;

        function fillProfile($prof, $data)
        {
            $prof->music_envy_today = $data['music_envy_today'] ?? $prof->music_envy_today;
            $prof->feeling = $data['feeling'] ?? $prof->feeling;
            $prof->music_preference = $data['music_preference'] ?? $prof->music_preference;
            $prof->music_style_preference = $data['music_style_preference'] ?? $prof->music_style_preference;
            $prof->music_reason = $data['music_reason'] ?? $prof->music_reason;
            $prof->listening_context = $data['listening_context'] ?? $prof->listening_context;
            $prof->current_music_type = $data['current_music_type'] ?? $prof->current_music_type;
            $prof->usual_listening_mode = $data['usual_listening_mode'] ?? $prof->usual_listening_mode;
            $prof->likes_discovery = $data['likes_discovery'] ?? $prof->likes_discovery;
            $prof->attend_live_concert = $data['attend_live_concert'] ?? $prof->attend_live_concert;
            $prof->repeat_listening = $data['repeat_listening'] ?? $prof->repeat_listening;
            $prof->explicit_ok = $data['explicit_ok'] ?? $prof->explicit_ok;
            $prof->avg_song_length = $data['avg_song_length'] ?? $prof->avg_song_length;
            $prof->avg_daily_listen_time = $data['avg_daily_listen_time'] ?? $prof->avg_daily_listen_time;
            $prof->recommanded_artists = $data['recommanded_artists'] ?? $prof->recommanded_artists;
        }

        if (! $profile) {
            $profile = new UserProfile;
            fillProfile($profile, $finalData);
            $profile->save();

            $user->profile_id = $profile->user_profile_id;
            $user->save();
        } else {
            fillProfile($profile, $finalData);
            $profile->save();
        }

        return new UserProfileResource($profile);
    }
}
