<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportGenre
 * 
 * @property string|null $genre_id
 * @property string|null $genre_parent_id
 * @property string|null $genre_title
 * @property string|null $genre_handle
 * @property string|null $genre_color
 * @property string|null $top_level
 *
 * @package App\Models
 */
class ImportGenre extends Model
{
	protected $table = 'import_genre';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'genre_id',
		'genre_parent_id',
		'genre_title',
		'genre_handle',
		'genre_color',
		'top_level'
	];
}
