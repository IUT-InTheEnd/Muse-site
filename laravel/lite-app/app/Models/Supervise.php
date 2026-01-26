<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Supervise
 * 
 * @property int $parent_id
 * @property int $child_id
 * 
 * @property Genre $genre
 *
 * @package App\Models
 */
class Supervise extends Model
{
	protected $table = 'supervise';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'parent_id' => 'int',
		'child_id' => 'int'
	];

	public function genre()
	{
		return $this->belongsTo(Genre::class, 'child_id');
	}
}
