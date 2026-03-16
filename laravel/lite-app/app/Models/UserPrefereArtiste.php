<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UserPrefereArtiste
 *
 * @property int $artist_id
 * @property int $user_id
 * @property Artist $artist
 * @property User $user
 */
class UserPrefereArtiste extends Model
{
    protected $table = 'user_prefere_artiste';
    public $incrementing = false;
    public $timestamps = false;

    protected $casts = [
        'artist_id' => 'int',
        'user_id' => 'int',
    ];

    public function artist()
    {
        return $this->belongsTo(Artist::class, 'artist_id', 'artist_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
