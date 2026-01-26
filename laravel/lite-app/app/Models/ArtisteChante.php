<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ArtisteChante
 * 
 * @property int $artist_id
 * @property int $language_id
 * 
 * @property Artist $artist
 * @property Language $language
 *
 * @package App\Models
 */
class ArtisteChante extends Model
{
	protected $table = 'artiste_chante';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'artist_id' => 'int',
		'language_id' => 'int'
	];

	public function artist()
	{
		return $this->belongsTo(Artist::class);
	}

	public function language()
	{
		return $this->belongsTo(Language::class);
	}
}
