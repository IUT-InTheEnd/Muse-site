<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TrackEchonest
 * 
 * @property int $track_id
 * @property float|null $acousticness
 * @property float|null $energy
 * @property float|null $instrumentalness
 * @property float|null $liveness
 * @property float|null $speechiness
 * @property float|null $valence
 * @property float|null $danceability
 * @property float|null $tempo
 * @property float|null $artist_discovery
 * @property float|null $artist_hottness
 * @property float|null $artist_familiarity
 * @property float|null $track_hottness
 * @property float|null $track_currency
 * 
 * @property Track $track
 *
 * @package App\Models
 */
class TrackEchonest extends Model
{
	protected $table = 'track_echonest';
	protected $primaryKey = 'track_id';
	public $timestamps = false;

	protected $casts = [
		'acousticness' => 'float',
		'energy' => 'float',
		'instrumentalness' => 'float',
		'liveness' => 'float',
		'speechiness' => 'float',
		'valence' => 'float',
		'danceability' => 'float',
		'tempo' => 'float',
		'artist_discovery' => 'float',
		'artist_hottness' => 'float',
		'artist_familiarity' => 'float',
		'track_hottness' => 'float',
		'track_currency' => 'float'
	];

	protected $fillable = [
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

	public function track()
	{
		return $this->belongsTo(Track::class);
	}
}
