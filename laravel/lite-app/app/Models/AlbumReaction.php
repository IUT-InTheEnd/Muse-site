<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlbumReaction extends Model
{
    protected $table = 'album_reaction';
    protected $primaryKey = 'reaction_id';

    protected $fillable = [
        'album_id',
        'user_id',
        'visitor_id',
        'reaction',
    ];

    public function album()
    {
        return $this->belongsTo(Album::class, 'album_id', 'album_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
