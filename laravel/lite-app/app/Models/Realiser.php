<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Realiser
 * 
 * @property int $album_id
 * @property int $track_id
 * @property int $artist_id
 * 
 * @property Album $album
 * @property Track $track
 * @property Artist $artist
 *
 * @package App\Models
 */
class Realiser extends Model
{
	protected $table = 'realiser';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'album_id' => 'int',
		'track_id' => 'int',
		'artist_id' => 'int'
	];

	public function album()
	{
		return $this->belongsTo(Album::class);
	}

	public function track()
	{
		return $this->belongsTo(Track::class);
	}

	public function artist()
	{
		return $this->belongsTo(Artist::class);
	}
}
