<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportArtist
 * 
 * @property string|null $artist_id
 * @property string|null $artist_name
 * @property string|null $artist_location
 * @property string|null $artist_latitude
 * @property string|null $artist_longitude
 * @property string|null $artist_favorites
 * @property string|null $artist_comments
 * @property string|null $artist_listens
 * @property string|null $artist_active_year_begin
 * @property string|null $artist_active_year_end
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
 * @property string|null $artist_date_created
 * @property string|null $artist_image_file
 *
 * @package App\Models
 */
class ImportArtist extends Model
{
	protected $table = 'import_artist';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'artist_id',
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
}
