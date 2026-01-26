<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportTrackGenre
 * 
 * @property string|null $track_id
 * @property string|null $genre_id
 *
 * @package App\Models
 */
class ImportTrackGenre extends Model
{
	protected $table = 'import_track_genre';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'track_id',
		'genre_id'
	];
}
