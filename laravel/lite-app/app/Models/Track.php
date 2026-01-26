<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Track
 * 
 * @property int $track_id
 * @property string $track_title
 * @property int|null $track_duration
 * @property Carbon|null $track_date_created
 * @property Carbon|null $track_date_recorded
 * @property string|null $track_composer
 * @property string|null $track_lyricist
 * @property string|null $track_publisher
 * @property int|null $track_listens
 * @property int|null $track_favorites
 * @property int|null $track_comments
 * @property int|null $track_interest
 * @property string|null $track_copyright_c
 * @property string|null $track_copyright_p
 * @property bool|null $track_explicit
 * @property string|null $track_explicit_note
 * @property bool|null $track_instrumental
 * @property string|null $track_language_code
 * @property string|null $track_url
 * @property string|null $track_file
 * @property string|null $track_image_file
 * @property int|null $license_id
 * 
 * @property License|null $license
 * @property Collection|UserEcoute[] $user_ecoutes
 * @property Collection|AjouteFavori[] $ajoute_favoris
 * @property TrackEchonest|null $track_echonest
 * @property Collection|Playlist[] $playlists
 * @property Collection|TrackChanterEn[] $track_chanter_ens
 * @property Collection|Realiser[] $realisers
 * @property Collection|ContientGenre[] $contient_genres
 *
 * @package App\Models
 */
class Track extends Model
{
	protected $table = 'track';
	protected $primaryKey = 'track_id';
	public $timestamps = false;

	protected $casts = [
		'track_duration' => 'int',
		'track_date_created' => 'datetime',
		'track_date_recorded' => 'datetime',
		'track_listens' => 'int',
		'track_favorites' => 'int',
		'track_comments' => 'int',
		'track_interest' => 'int',
		'track_explicit' => 'bool',
		'track_instrumental' => 'bool',
		'license_id' => 'int'
	];

	protected $fillable = [
		'track_title',
		'track_duration',
		'track_date_created',
		'track_date_recorded',
		'track_composer',
		'track_lyricist',
		'track_publisher',
		'track_listens',
		'track_favorites',
		'track_comments',
		'track_interest',
		'track_copyright_c',
		'track_copyright_p',
		'track_explicit',
		'track_explicit_note',
		'track_instrumental',
		'track_language_code',
		'track_url',
		'track_file',
		'track_image_file',
		'license_id'
	];

	public function license()
	{
		return $this->belongsTo(License::class);
	}

	public function user_ecoutes()
	{
		return $this->hasMany(UserEcoute::class);
	}

	public function ajoute_favoris()
	{
		return $this->hasMany(AjouteFavori::class);
	}

	public function track_echonest()
	{
		return $this->hasOne(TrackEchonest::class);
	}

	public function playlists()
	{
		return $this->belongsToMany(Playlist::class, 'playlist_contient_track');
	}

	public function track_chanter_ens()
	{
		return $this->hasMany(TrackChanterEn::class);
	}

	public function realisers()
	{
		return $this->hasMany(Realiser::class);
	}

	public function contient_genres()
	{
		return $this->hasMany(ContientGenre::class);
	}
}
