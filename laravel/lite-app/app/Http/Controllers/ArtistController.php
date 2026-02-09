<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use Illuminate\Http\Request;
use App\Models\Track;
use App\Models\Album;
use App\Models\Realiser;
use Inertia\Inertia; 

class ArtistController extends Controller
{
    public function show(string $id)
    {
        $artist = Artist::findOrFail($id);

        $tracks = Track::whereHas('realisers', function ($query) use ($id) {
            $query->where('artist_id', $id);
        })
        ->with('realisers.artist') 
        ->get() 
        ->map(function ($track) {
            return [
                'id'       => $track->track_id,
                'title'    => $track->track_title,
                'url'      => $track->track_file,
                'artwork'  => $track->track_image_file, 
                'duration' => $track->track_duration,
                'listens' => $track->track_listens,
                'date' => $track->track_date_created
            ];
        });

        $albumIds = Realiser::where('artist_id', $id)
                    ->pluck('album_id')
            ->unique()
            ->filter()
            ->toArray();

        $albums = Album::whereIn('album_id', $albumIds)
            ->get()
            ->map(function ($album) {
                return [
                    'id' => $album->album_id,
                    'title' => $album->album_title,
                    'date' => $album->album_date_created,
                    'type' => $album->album_type,
                    'artwork' => $album->album_url 
                ];
            });

        return Inertia::render('artists/artist', [
            'artist' => $artist,
            'tracks' => $tracks, 
            'albums' => $albums
        ]);
    }
    
}
