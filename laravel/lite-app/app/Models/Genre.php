<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Genre
 * 
 * @property int $genre_id
 * @property int|null $genre_parent_id
 * @property string $genre_title
 * @property string|null $genre_handle
 * @property string|null $genre_color
 * @property bool|null $top_level
 * 
 * @property Collection|AjouteGenreFavori[] $ajoute_genre_favoris
 * @property Collection|Supervise[] $supervises
 * @property Collection|ContientGenre[] $contient_genres
 *
 * @package App\Models
 */
class Genre extends Model
{
	protected $table = 'genre';
	protected $primaryKey = 'genre_id';
	public $timestamps = false;

	protected $casts = [
		'genre_parent_id' => 'int',
		'top_level' => 'bool'
	];

	protected $fillable = [
		'genre_parent_id',
		'genre_title',
		'genre_handle',
		'genre_color',
		'top_level'
	];

	public function ajoute_genre_favoris()
	{
		return $this->hasMany(AjouteGenreFavori::class);
	}

	public function supervises()
	{
		return $this->hasMany(Supervise::class, 'child_id');
	}

	public function contient_genres()
	{
		return $this->hasMany(ContientGenre::class);
	}
}
