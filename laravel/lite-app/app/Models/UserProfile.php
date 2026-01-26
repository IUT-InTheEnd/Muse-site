<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserProfile
 * 
 * @property int $user_profile_id
 * @property string $music_envy_today
 * @property int $feeling
 * @property int $music_preference
 * @property int $music_style_preference
 * @property string $music_reason
 * @property string $listening_context
 * @property int|null $current_music_type
 * @property int $usual_listening_mode
 * @property int $likes_discovery
 * @property int $attend_live_concert
 * @property int $repeat_listening
 * @property int $explicit_ok
 * @property float $avg_song_length
 * @property float $avg_daily_listen_time
 * @property string|null $recommanded_artists
 * 
 * @property Collection|User[] $users
 *
 * @package App\Models
 */
class UserProfile extends Model
{
	protected $table = 'user_profile';
	protected $primaryKey = 'user_profile_id';
	public $timestamps = false;

	protected $casts = [
		'feeling' => 'int',
		'music_preference' => 'int',
		'music_style_preference' => 'int',
		'current_music_type' => 'int',
		'usual_listening_mode' => 'int',
		'likes_discovery' => 'int',
		'attend_live_concert' => 'int',
		'repeat_listening' => 'int',
		'explicit_ok' => 'int',
		'avg_song_length' => 'float',
		'avg_daily_listen_time' => 'float'
	];

	protected $fillable = [
		'music_envy_today',
		'feeling',
		'music_preference',
		'music_style_preference',
		'music_reason',
		'listening_context',
		'current_music_type',
		'usual_listening_mode',
		'likes_discovery',
		'attend_live_concert',
		'repeat_listening',
		'explicit_ok',
		'avg_song_length',
		'avg_daily_listen_time',
		'recommanded_artists'
	];

	public function users()
	{
		return $this->hasMany(User::class, 'profile_id');
	}
}
