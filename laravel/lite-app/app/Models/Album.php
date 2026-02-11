<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Album
 * 
 * @property int $album_id
 * @property string $album_title
 * @property Carbon|null $album_date_release
 * @property Carbon|null $album_date_created
 * @property int|null $album_listens
 * @property int|null $album_favorites
 * @property int|null $album_comments
 * @property string|null $album_type
 * @property string|null $album_url
 * @property string|null $album_handle
 * @property string|null $album_information
 * @property int|null $album_tracks
 * @property string|null $album_producer
 * @property string|null $album_engineer
 * @property string|null $album_image_file
 * 
 * @property Collection|Realiser[] $realisers
 * @property Collection|User[] $users
 *
 * @package App\Models
 */
class Album extends Model
{
	protected $table = 'album';
	protected $primaryKey = 'album_id';
	public $timestamps = false;

	protected $casts = [
		'album_date_release' => 'datetime',
		'album_date_created' => 'datetime',
		'album_listens' => 'int',
		'album_favorites' => 'int',
		'album_comments' => 'int',
		'album_tracks' => 'int'
	];

	protected $fillable = [
		'album_title',
		'album_date_release',
		'album_date_created',
		'album_listens',
		'album_favorites',
		'album_comments',
		'album_type',
		'album_url',
		'album_handle',
		'album_information',
		'album_tracks',
		'album_producer',
		'album_engineer',
		'album_image_file'
	];

	public function realisers()
	{
		return $this->hasMany(Realiser::class);
	}

	public function users()
	{
		return $this->belongsToMany(User::class, 'user_ajoute_album_favoris');
	}
}
