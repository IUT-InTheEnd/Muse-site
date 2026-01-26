<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Playlist
 * 
 * @property int $playlist_id
 * @property string $playlist_name
 * @property int|null $track_id
 * 
 * @property Track|null $track
 * @property Collection|Track[] $tracks
 * @property Collection|PossedePlaylist[] $possede_playlists
 *
 * @package App\Models
 */
class Playlist extends Model
{
	protected $table = 'playlist';
	protected $primaryKey = 'playlist_id';
	public $timestamps = false;

	protected $casts = [
		'track_id' => 'int'
	];

	protected $fillable = [
		'playlist_name',
		'track_id'
	];

	public function track()
	{
		return $this->belongsTo(Track::class);
	}

	public function tracks()
	{
		return $this->belongsToMany(Track::class, 'playlist_contient_track');
	}

	public function possede_playlists()
	{
		return $this->hasMany(PossedePlaylist::class);
	}
}
