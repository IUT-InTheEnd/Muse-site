<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UserAjouteAlbumFavori
 * 
 * @property int $user_id
 * @property int $album_id
 * 
 * @property User $user
 * @property Album $album
 *
 * @package App\Models
 */
class UserAjouteAlbumFavori extends Model
{
	protected $table = 'user_ajoute_album_favoris';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'album_id' => 'int'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function album()
	{
		return $this->belongsTo(Album::class);
	}
}
