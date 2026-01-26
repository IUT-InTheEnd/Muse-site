<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportAlbum
 * 
 * @property string|null $album_id
 * @property string|null $album_title
 * @property string|null $album_date_release
 * @property string|null $album_date_created
 * @property string|null $album_listens
 * @property string|null $album_favorites
 * @property string|null $album_comments
 * @property string|null $album_type
 * @property string|null $album_url
 * @property string|null $album_handle
 * @property string|null $album_information
 * @property string|null $album_tracks
 * @property string|null $album_producer
 * @property string|null $album_engineer
 * @property string|null $album_image_file
 *
 * @package App\Models
 */
class ImportAlbum extends Model
{
	protected $table = 'import_album';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'album_id',
		'album_title',
		'album_date_release',
		'album_date_created',
		'album_listens',
		'album_favorites',
		'album_comments',
		'album_type',
		'album_url',
		'album_handle',
		'album_information',
		'album_tracks',
		'album_producer',
		'album_engineer',
		'album_image_file'
	];
}
