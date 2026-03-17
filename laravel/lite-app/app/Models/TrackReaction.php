<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrackReaction extends Model
{
    protected $table = 'track_reaction';
    protected $primaryKey = 'reaction_id';

    protected $fillable = [
        'track_id',
        'user_id',
        'visitor_id',
        'reaction',
    ];

    public function track()
    {
        return $this->belongsTo(Track::class, 'track_id', 'track_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
