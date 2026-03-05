<?php

namespace App\Http\Resources;

use App\Enums\ListeningContext;
use App\Enums\MusicEnvy;
use App\Enums\MusicReason;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('UserProfile')]
class UserProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'profile_id' => $this->user_profile_id,
            /** @var array<MusicEnvy> */
            'music_envy_today' => $this->music_envy_today == 'nan' ? [] : eval('return'.$this->music_envy_today.';'),
            'feeling' => $this->feeling,
            'music_preference' => $this->music_preference,
            'music_style_preference' => $this->music_style_preference,
            /** @var array<MusicReason> */
            'music_reason' => $this->music_reason == 'nan' ? [] : eval('return'.$this->music_reason.';'),
            /** @var array<ListeningContext> */
            'listening_context' => $this->listening_context == 'nan' ? [] : eval('return'.$this->listening_context.';'),
            'current_music_type' => $this->current_music_type,
            'usual_listening_mode' => $this->usual_listening_mode,
            'likes_discovery' => $this->likes_discovery,
            'attend_live_concert' => $this->attent_live_concert,
            'repeat_listening' => $this->repeat_listening,
            'explicit_ok' => boolval($this->explicit_ok),
            'avg_song_length' => $this->avg_song_length,
            'avg_daily_listen_time' => $this->avg_daily_listen_time,
            /** @var array<string> */
            'recommanded_artists' => $this->recommanded_artists == 'nan' ? [] : eval('return'.$this->recommanded_artists.';'),
        ];
    }
}
