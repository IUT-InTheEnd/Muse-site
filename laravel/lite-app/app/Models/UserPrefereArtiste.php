<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UserPrefereArtiste
 * 
 * @property int $artist_id
 * @property int $user_id
 * 
 * @property Artist $artist
 * @property User $user
 *
 * @package App\Models
 */
class UserPrefereArtiste extends Model
{
	protected $table = 'user_prefere_artiste';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'artist_id' => 'int',
		'user_id' => 'int'
	];

	public function artist()
	{
		return $this->belongsTo(Artist::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
