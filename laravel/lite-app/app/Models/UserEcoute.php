<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserEcoute
 * 
 * @property int $user_id
 * @property int $track_id
 * @property int|null $nb_ecoute
 * @property Carbon|null $last_listen
 * 
 * @property User $user
 * @property Track $track
 *
 * @package App\Models
 */
class UserEcoute extends Model
{
	protected $table = 'user_ecoute';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'track_id' => 'int',
		'nb_ecoute' => 'int',
		'last_listen' => 'datetime'
	];

	protected $fillable = [
		'nb_ecoute',
		'last_listen'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function track()
	{
		return $this->belongsTo(Track::class);
	}
}
