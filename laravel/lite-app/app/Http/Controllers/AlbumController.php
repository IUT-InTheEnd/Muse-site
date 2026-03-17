<?php

namespace App\Http\Controllers;

use App\Http\Resources\AlbumResource;
use App\Models\Album;
use App\Models\Realiser;
use App\Models\Artist;
use App\Models\Track;
use App\Services\ReactionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlbumController extends Controller
{
    public function __construct(private ReactionService $reactions) {}

    public function view(Request $request, $id)
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
        $trackReactions = $this->reactions->trackReactionsFor($request, collect($listeTracks)->pluck('track.track_id'));
        $albumReaction = $this->reactions->albumReactionsFor($request, [$album->album_id]);

        return Inertia::render('album', [
            'album' => $album,
            'artistes' => $artistes,
            'nombreMusiques' => $nombre,
            'listeMusiques' => $listeTracks,
            'albumReaction' => $albumReaction[$album->album_id] ?? null,
            'trackReactions' => $trackReactions,
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
