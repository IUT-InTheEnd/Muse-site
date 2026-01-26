<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AjouteFavori
 * 
 * @property int $user_id
 * @property int $track_id
 * 
 * @property User $user
 * @property Track $track
 *
 * @package App\Models
 */
class AjouteFavori extends Model
{
	protected $table = 'ajoute_favori';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'track_id' => 'int'
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
