<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Artist
 * 
 * @property int $artist_id
 * @property string $artist_name
 * @property string|null $artist_location
 * @property float|null $artist_latitude
 * @property float|null $artist_longitude
 * @property int|null $artist_favorites
 * @property int|null $artist_comments
 * @property int|null $artist_listens
 * @property int|null $artist_active_year_begin
 * @property int|null $artist_active_year_end
 * @property string|null $artist_url
 * @property string|null $artist_website
 * @property string|null $artist_wikipedia_page
 * @property string|null $artist_handle
 * @property string|null $artist_bio
 * @property string|null $artist_members
 * @property string|null $artist_associated_labels
 * @property string|null $artist_related_projects
 * @property string|null $artist_contact
 * @property string|null $artist_donation_url
 * @property string|null $artist_paypal_name
 * @property string|null $artist_flattr_name
 * @property Carbon|null $artist_date_created
 * @property string|null $artist_image_file
 * 
 * @property Collection|ArtisteChante[] $artiste_chantes
 * @property Collection|Realiser[] $realisers
 * @property Collection|User[] $users
 *
 * @package App\Models
 */
class Artist extends Model
{
	protected $table = 'artist';
	protected $primaryKey = 'artist_id';
	public $timestamps = false;

	protected $casts = [
		'artist_latitude' => 'float',
		'artist_longitude' => 'float',
		'artist_favorites' => 'int',
		'artist_comments' => 'int',
		'artist_listens' => 'int',
		'artist_active_year_begin' => 'int',
		'artist_active_year_end' => 'int',
		'artist_date_created' => 'datetime'
	];

	protected $fillable = [
		'artist_name',
		'artist_location',
		'artist_latitude',
		'artist_longitude',
		'artist_favorites',
		'artist_comments',
		'artist_listens',
		'artist_active_year_begin',
		'artist_active_year_end',
		'artist_url',
		'artist_website',
		'artist_wikipedia_page',
		'artist_handle',
		'artist_bio',
		'artist_members',
		'artist_associated_labels',
		'artist_related_projects',
		'artist_contact',
		'artist_donation_url',
		'artist_paypal_name',
		'artist_flattr_name',
		'artist_date_created',
		'artist_image_file'
	];

	public function artiste_chantes()
	{
		return $this->hasMany(ArtisteChante::class);
	}

	public function realisers()
	{
		return $this->hasMany(Realiser::class);
	}

	public function users()
	{
		return $this->belongsToMany(User::class, 'user_prefere_artiste', 'artist_id', 'user_id');
	}
}
