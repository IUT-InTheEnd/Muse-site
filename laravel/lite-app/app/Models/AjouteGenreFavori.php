<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AjouteGenreFavori
 * 
 * @property int $user_id
 * @property int $genre_id
 * 
 * @property User $user
 * @property Genre $genre
 *
 * @package App\Models
 */
class AjouteGenreFavori extends Model
{
	protected $table = 'ajoute_genre_favoris';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'genre_id' => 'int'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function genre()
	{
		return $this->belongsTo(Genre::class);
	}
}
