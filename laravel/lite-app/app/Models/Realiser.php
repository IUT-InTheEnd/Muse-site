<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Realiser
 *
 * @property int $album_id
 * @property int $track_id
 * @property int $artist_id
 * @property Album $album
 * @property Track $track
 * @property Artist $artist
 */
class Realiser extends Model
{
    protected $table = 'realiser';

    public $incrementing = false;

    public $timestamps = false;

    protected $casts = [
        'album_id' => 'int',
        'track_id' => 'int',
        'artist_id' => 'int',
    ];

    public function album()
    {
        return $this->belongsTo(Album::class, 'album_id', 'album_id');
    }

    public function track()
    {
        return $this->belongsTo(Track::class, 'track_id', 'track_id');
    }

    public function artist()
    {
        return $this->belongsTo(Artist::class, 'artist_id', 'artist_id');
    }
}
