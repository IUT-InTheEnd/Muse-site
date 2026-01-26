<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportTrack
 * 
 * @property string|null $track_id
 * @property string|null $track_title
 * @property string|null $track_duration
 * @property string|null $track_date_created
 * @property string|null $track_date_recorded
 * @property string|null $track_composer
 * @property string|null $track_lyricist
 * @property string|null $track_publisher
 * @property string|null $track_listens
 * @property string|null $track_favorites
 * @property string|null $track_comments
 * @property string|null $track_interest
 * @property string|null $track_copyright_c
 * @property string|null $track_copyright_p
 * @property string|null $track_explicit
 * @property string|null $track_explicit_note
 * @property string|null $track_instrumental
 * @property string|null $track_language_code
 * @property string|null $track_url
 * @property string|null $track_file
 * @property string|null $track_image_file
 * @property string|null $license_id
 * @property string|null $artist_id
 * @property string|null $album_id
 * @property string|null $language_id
 *
 * @package App\Models
 */
class ImportTrack extends Model
{
	protected $table = 'import_track';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'track_id',
		'track_title',
		'track_duration',
		'track_date_created',
		'track_date_recorded',
		'track_composer',
		'track_lyricist',
		'track_publisher',
		'track_listens',
		'track_favorites',
		'track_comments',
		'track_interest',
		'track_copyright_c',
		'track_copyright_p',
		'track_explicit',
		'track_explicit_note',
		'track_instrumental',
		'track_language_code',
		'track_url',
		'track_file',
		'track_image_file',
		'license_id',
		'artist_id',
		'album_id',
		'language_id'
	];
}
