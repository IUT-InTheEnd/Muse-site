<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ImportLanguage
 * 
 * @property string|null $language_id
 * @property string|null $language_code
 * @property string|null $language_name
 * @property string|null $language_handle
 *
 * @package App\Models
 */
class ImportLanguage extends Model
{
	protected $table = 'import_language';
	public $incrementing = false;
	public $timestamps = false;

	protected $fillable = [
		'language_id',
		'language_code',
		'language_name',
		'language_handle'
	];
}
