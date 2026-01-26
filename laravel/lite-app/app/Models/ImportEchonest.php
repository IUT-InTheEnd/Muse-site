<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportEchonest
 * 
 * @property string|null $track_id
 * @property string|null $acousticness
 * @property string|null $energy
 * @property string|null $instrumentalness
 * @property string|null $liveness
 * @property string|null $speechiness
 * @property string|null $valence
 * @property string|null $danceability
 * @property string|null $tempo
 * @property string|null $artist_discovery
 * @property string|null $artist_hottness
 * @property string|null $artist_familiarity
 * @property string|null $track_hottness
 * @property string|null $track_currency
 *
 * @package App\Models
 */
class ImportEchonest extends Model
{
	protected $table = 'import_echonest';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'track_id',
		'acousticness',
		'energy',
		'instrumentalness',
		'liveness',
		'speechiness',
		'valence',
		'danceability',
		'tempo',
		'artist_discovery',
		'artist_hottness',
		'artist_familiarity',
		'track_hottness',
		'track_currency'
	];
}
