<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Class PlaylistContientTrack
 * 
 * @property int $playlist_id
 * @property int $track_id
 * @property int $position
 * 
 * @property Playlist $playlist
 * @property Track $track
 *
 * @package App\Models
 */
class PlaylistContientTrack extends Pivot
{
	protected $table = 'playlist_contient_track';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'playlist_id' => 'int',
		'track_id' => 'int',
		'position' => 'int',
	];

    protected $fillable = [
        'playlist_id',
        'track_id',
        'position',
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
