<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Represente
 * 
 * @property int $user_id
 * @property int $user_id_echonest
 * 
 * @property User $user
 * @property UserPreferenceEchonest $user_preference_echonest
 *
 * @package App\Models
 */
class Represente extends Model
{
	protected $table = 'represente';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'user_id_echonest' => 'int'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function user_preference_echonest()
	{
		return $this->belongsTo(UserPreferenceEchonest::class, 'user_id_echonest');
	}
}
