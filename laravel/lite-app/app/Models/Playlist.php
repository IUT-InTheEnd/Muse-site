<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Playlist
 * 
 * @property int|null $user_id
 * @property int $playlist_id
 * @property string $playlist_name
 * @property string|null $playlist_description
 * @property Carbon|null $playlist_date_created
 * @property Carbon|null $playlist_date_updated
 * @property int|null $playlist_listens
 * @property int|null $playlist_favorites
 * @property bool|null $playlist_public
 * @property string|null $playlist_image_file
 * @property bool|null $playlist_deletable
 * 
 * @property User|null $user
 * @property Collection|Track[] $tracks
 *
 * @package App\Models
 */
class Playlist extends Model
{
	protected $table = 'playlist';
	protected $primaryKey = 'playlist_id';
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'playlist_date_created' => 'datetime',
		'playlist_date_updated' => 'datetime',
		'playlist_listens' => 'int',
		'playlist_favorites' => 'int',
		'playlist_public' => 'bool',
		'playlist_deletable' => 'bool'
	];

	protected $fillable = [
		'user_id',
		'playlist_name',
		'playlist_description',
		'playlist_date_created',
		'playlist_date_updated',
		'playlist_listens',
		'playlist_favorites',
		'playlist_public',
		'playlist_image_file',
		'playlist_deletable'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function tracks()
	{
		return $this->belongsToMany(Track::class, 'playlist_contient_track');
	}
}
