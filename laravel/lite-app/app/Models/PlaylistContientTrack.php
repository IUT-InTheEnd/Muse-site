<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class PlaylistContientTrack
 * 
 * @property int $playlist_id
 * @property int $track_id
 * 
 * @property Playlist $playlist
 * @property Track $track
 *
 * @package App\Models
 */
class PlaylistContientTrack extends Model
{
	protected $table = 'playlist_contient_track';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'playlist_id' => 'int',
		'track_id' => 'int'
	];

	public function playlist()
	{
		return $this->belongsTo(Playlist::class);
	}

	public function track()
	{
		return $this->belongsTo(Track::class);
	}
}
