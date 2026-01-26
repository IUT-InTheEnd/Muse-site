<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportLicense
 * 
 * @property string|null $license_id
 * @property string|null $license_title
 * @property string|null $license_url
 *
 * @package App\Models
 */
class ImportLicense extends Model
{
	protected $table = 'import_license';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'license_id',
		'license_title',
		'license_url'
	];
}
