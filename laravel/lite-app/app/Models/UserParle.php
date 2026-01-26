<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UserParle
 * 
 * @property int $user_id
 * @property int $language_id
 * 
 * @property User $user
 * @property Language $language
 *
 * @package App\Models
 */
class UserParle extends Model
{
	protected $table = 'user_parle';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'user_id' => 'int',
		'language_id' => 'int'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function language()
	{
		return $this->belongsTo(Language::class);
	}
}
