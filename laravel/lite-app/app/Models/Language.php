<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Language
 * 
 * @property int $language_id
 * @property string $language_label
 * @property string|null $language_handle
 * 
 * @property Collection|UserParle[] $user_parles
 * @property Collection|ArtisteChante[] $artiste_chantes
 * @property Collection|TrackChanterEn[] $track_chanter_ens
 *
 * @package App\Models
 */
class Language extends Model
{
	protected $table = 'language';
	protected $primaryKey = 'language_id';
	public $timestamps = false;

	protected $fillable = [
		'language_label',
		'language_handle'
	];

	public function user_parles()
	{
		return $this->hasMany(UserParle::class);
	}

	public function artiste_chantes()
	{
		return $this->hasMany(ArtisteChante::class);
	}

	public function track_chanter_ens()
	{
		return $this->hasMany(TrackChanterEn::class);
	}
}
