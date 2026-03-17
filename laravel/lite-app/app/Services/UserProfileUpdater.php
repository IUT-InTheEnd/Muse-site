<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;

class UserProfileUpdater
{
    public function update(User $user, array $validatedData): UserProfile
    {
        foreach (['music_envy_today', 'music_reason', 'listening_context', 'recommanded_artists'] as $field) {
            if (! array_key_exists($field, $validatedData)) {
                $validatedData[$field] = null;
            }
        }

        $finalData = $validatedData;
        $finalData['music_envy_today'] = $this->compactList($validatedData['music_envy_today']);
        $finalData['music_reason'] = $this->compactList($validatedData['music_reason']);
        $finalData['listening_context'] = $this->compactList($validatedData['listening_context']);
        $finalData['recommanded_artists'] = $this->compactList($validatedData['recommanded_artists']);

        $profile = $user->user_profile ?? new UserProfile;
        $this->fillProfile($profile, $finalData);
        $profile->save();

        if (! $user->profile_id) {
            $user->profile_id = $profile->user_profile_id;
            $user->save();
        }

        return $profile->fresh();
    }

    private function compactList(?array $list): ?string
    {
        if (is_null($list)) {
            return null;
        }

        return '['.implode(', ', array_map(
            fn (string $value): string => "'".$value."'",
            $list,
        )).']';
    }

    private function fillProfile(UserProfile $profile, array $data): void
    {
        $profile->music_envy_today = $data['music_envy_today'] ?? $profile->music_envy_today;
        $profile->feeling = $data['feeling'] ?? $profile->feeling;
        $profile->music_preference = $data['music_preference'] ?? $profile->music_preference;
        $profile->music_style_preference = $data['music_style_preference'] ?? $profile->music_style_preference;
        $profile->music_reason = $data['music_reason'] ?? $profile->music_reason;
        $profile->listening_context = $data['listening_context'] ?? $profile->listening_context;
        $profile->current_music_type = $data['current_music_type'] ?? $profile->current_music_type;
        $profile->usual_listening_mode = $data['usual_listening_mode'] ?? $profile->usual_listening_mode;
        $profile->likes_discovery = $data['likes_discovery'] ?? $profile->likes_discovery;
        $profile->attend_live_concert = $data['attend_live_concert'] ?? $profile->attend_live_concert;
        $profile->repeat_listening = $data['repeat_listening'] ?? $profile->repeat_listening;
        $profile->explicit_ok = $data['explicit_ok'] ?? $profile->explicit_ok;
        $profile->avg_song_length = $data['avg_song_length'] ?? $profile->avg_song_length;
        $profile->avg_daily_listen_time = $data['avg_daily_listen_time'] ?? $profile->avg_daily_listen_time;
        $profile->recommanded_artists = $data['recommanded_artists'] ?? $profile->recommanded_artists;
    }
}
