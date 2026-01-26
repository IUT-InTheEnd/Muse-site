<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TrackChanterEn
 * 
 * @property int $track_id
 * @property int $language_id
 * 
 * @property Track $track
 * @property Language $language
 *
 * @package App\Models
 */
class TrackChanterEn extends Model
{
	protected $table = 'track_chanter_en';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'track_id' => 'int',
		'language_id' => 'int'
	];

	public function track()
	{
		return $this->belongsTo(Track::class);
	}

	public function language()
	{
		return $this->belongsTo(Language::class);
	}
}
