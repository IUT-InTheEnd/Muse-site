<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class PossedePlaylist
 * 
 * @property int $user_id
 * @property int $playlist_id
 * 
 * @property User $user
 * @property Playlist $playlist
 *
 * @package App\Models
 */
class PossedePlaylist extends Model
{
	protected $table = 'possede_playlist';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'playlist_id' => 'int'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function playlist()
	{
		return $this->belongsTo(Playlist::class);
	}
}
