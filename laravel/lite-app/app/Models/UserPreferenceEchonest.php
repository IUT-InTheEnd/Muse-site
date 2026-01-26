<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserPreferenceEchonest
 * 
 * @property int $user_id
 * @property float|null $acousticness
 * @property float|null $energy
 * @property float|null $instrumentalness
 * @property float|null $liveness
 * @property float|null $speechiness
 * @property float|null $valence
 * @property float|null $danceability
 * @property float|null $tempo
 * 
 * @property User $user
 * @property Collection|Represente[] $representes
 *
 * @package App\Models
 */
class UserPreferenceEchonest extends Model
{
	protected $table = 'user_preference_echonest';
	protected $primaryKey = 'user_id';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'acousticness' => 'float',
		'energy' => 'float',
		'instrumentalness' => 'float',
		'liveness' => 'float',
		'speechiness' => 'float',
		'valence' => 'float',
		'danceability' => 'float',
		'tempo' => 'float'
	];

	protected $fillable = [
		'acousticness',
		'energy',
		'instrumentalness',
		'liveness',
		'speechiness',
		'valence',
		'danceability',
		'tempo'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function representes()
	{
		return $this->hasMany(Represente::class, 'user_id_echonest');
	}
}
