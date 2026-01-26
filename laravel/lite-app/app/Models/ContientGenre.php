<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ContientGenre
 * 
 * @property int $track_id
 * @property int $genre_id
 * 
 * @property Track $track
 * @property Genre $genre
 *
 * @package App\Models
 */
class ContientGenre extends Model
{
	protected $table = 'contient_genres';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'track_id' => 'int',
		'genre_id' => 'int'
	];

	public function track()
	{
		return $this->belongsTo(Track::class);
	}

	public function genre()
	{
		return $this->belongsTo(Genre::class);
	}
}
