<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UserPrivacy
 *
 * @property int|null $id
 * @property bool|null $public_profile_visibility
 * @property User|null $user
 */
class UserPrivacy extends Model
{
    protected $table = 'user_privacy';

    public $incrementing = false;

    public $timestamps = false;

    protected $casts = [
        'id' => 'int',
        'public_profile_visibility' => 'bool',
    ];

    protected $fillable = [
        'id',
        'public_profile_visibility',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id');
    }
}
