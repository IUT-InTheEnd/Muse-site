<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Album;
use App\Models\Realiser;
use App\Models\Artist;
use App\Models\Track;
use Inertia\Inertia;

class AlbumController extends Controller
{
    public function view($id)
    {
        $album = Album::findOrFail($id);

        $toutRealiser = Realiser::where('album_id', $id)->get();

        $nombre = $toutRealiser->count();

        $listeTracks = [];

        for ($i=0; $i < $nombre; $i++) { 
            $listeTracks[$i] = Track::find($toutRealiser[$i]->track_id);
        }

        $artiste = Artist::find($toutRealiser[0]->artist_id);

        return Inertia::render('album', [
            'album' => $album,
            'artiste' => $artiste,
            'nombreMusiques' => $nombre,
            'listeMusiques' => $listeTracks
        ]);
    }   
}   
