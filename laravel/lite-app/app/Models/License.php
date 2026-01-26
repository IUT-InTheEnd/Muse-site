<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class License
 * 
 * @property int $license_id
 * @property string $license_title
 * @property string|null $license_url
 * 
 * @property Collection|Track[] $tracks
 *
 * @package App\Models
 */
class License extends Model
{
	protected $table = 'license';
	protected $primaryKey = 'license_id';
	public $timestamps = false;

	protected $fillable = [
		'license_title',
		'license_url'
	];

	public function tracks()
	{
		return $this->hasMany(Track::class);
	}
}
