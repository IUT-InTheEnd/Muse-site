<?php

namespace App\Http\Controllers;

use App\Http\Resources\AlbumResource;
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

        for ($i = 0; $i < $nombre; $i++) {
            $listeTracks[$i]['track'] = Track::find($toutRealiser[$i]->track_id);
            $listeTracks[$i]['artist'] = Artist::find($toutRealiser[$i]->artist_id);
        }

        $artistes = Artist::find($toutRealiser->pluck('artist_id'));

        return Inertia::render('album', [
            'album' => $album,
            'artistes' => $artistes,
            'nombreMusiques' => $nombre,
            'listeMusiques' => $listeTracks,
        ]);
    }

    /**
     * @unauthenticated
     */
    public function getAlbum(int $id)
    {
        return new AlbumResource(Album::findOrFail($id));
    }

    /**
     * @unauthenticated
     */
    public function getAllAlbums()
    {
        return AlbumResource::collection(Album::paginate());
    }
}
