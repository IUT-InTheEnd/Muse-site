<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class User
 * 
 * @property int $user_id
 * @property string $user_pseudo
 * @property float $user_age
 * @property string|null $user_job
 * @property string|null $user_plays_music
 * @property string|null $user_gender
 * @property string|null $user_instruments
 * @property string|null $user_music_contexts
 * @property int $profile_id
 * 
 * @property UserProfile $user_profile
 * @property Collection|AjouteGenreFavori[] $ajoute_genre_favoris
 * @property Collection|Album[] $albums
 * @property Collection|UserEcoute[] $user_ecoutes
 * @property Collection|AjouteFavori[] $ajoute_favoris
 * @property UserPreferenceEchonest|null $user_preference_echonest
 * @property Collection|PossedePlaylist[] $possede_playlists
 * @property Collection|Represente[] $representes
 * @property Collection|UserParle[] $user_parles
 * @property Collection|Artist[] $artists
 *
 * @package App\Models
 */
class User extends Model
{
	protected $table = 'user';
	protected $primaryKey = 'user_id';
	public $timestamps = false;

	protected $casts = [
		'user_age' => 'float',
		'profile_id' => 'int'
	];

	protected $fillable = [
		'user_pseudo',
		'user_age',
		'user_job',
		'user_plays_music',
		'user_gender',
		'user_instruments',
		'user_music_contexts',
		'profile_id'
	];

	public function user_profile()
	{
		return $this->belongsTo(UserProfile::class, 'profile_id');
	}

	public function ajoute_genre_favoris()
	{
		return $this->hasMany(AjouteGenreFavori::class);
	}

	public function albums()
	{
		return $this->belongsToMany(Album::class, 'user_ajoute_album_favoris');
	}

	public function user_ecoutes()
	{
		return $this->hasMany(UserEcoute::class);
	}

	public function ajoute_favoris()
	{
		return $this->hasMany(AjouteFavori::class);
	}

	public function user_preference_echonest()
	{
		return $this->hasOne(UserPreferenceEchonest::class);
	}

	public function possede_playlists()
	{
		return $this->hasMany(PossedePlaylist::class);
	}

	public function representes()
	{
		return $this->hasMany(Represente::class);
	}

	public function user_parles()
	{
		return $this->hasMany(UserParle::class);
	}

	public function artists()
	{
		return $this->belongsToMany(Artist::class, 'user_prefere_artiste');
	}
}
