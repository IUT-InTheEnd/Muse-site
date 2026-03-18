<?php

namespace App\Http\Controllers;

use App\Http\Resources\ArtistResource;
use App\Models\Artist;
use App\Services\ArtistPageQueryService;
use App\Services\ReactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;


class ArtistController extends Controller
{
    public function __construct(
        private ReactionService $reactions,
        private ArtistPageQueryService $artistPage,
    ) {}

    public function show(Request $request, string $id)
    {
        $artist = $this->artistPage->artistOrFail($id);
        $isFollowing = $this->artistPage->isFollowing(auth()->user(), $id);
        $tracks = $this->artistPage->tracksForArtist($id);
        $albums = $this->artistPage->albumsForArtist($id);
        $trackReactions = $this->reactions->trackReactionsFor($request, $tracks->pluck('id'));

        return Inertia::render('artists/artist', [
            'artist' => $artist,
            'tracks' => $tracks,
            'albums' => $albums,
            'isFollowing' => $isFollowing,
            'trackReactions' => $trackReactions,
        ]);
    }
    
    public function allTracks(Request $request, string $id)
    {
        $artist = $this->artistPage->artistOrFail($id);
        $albums = $this->artistPage->albumsWithTracksForArtist($id);

        $trackReactions = $this->reactions->trackReactionsFor(
            $request,
            $albums->flatMap(fn ($album) => collect($album['tracks'])->pluck('id')),
        );

        return Inertia::render('artists/all_tracks', [
            'artist' => $artist,
            'albums' => $albums,
            'trackReactions' => $trackReactions,
        ]);
    }

    public function follow(string $id): RedirectResponse
    {
        Artist::findOrFail($id);

        $user = auth()->user();
        if ($user) {
            $user->artists()->syncWithoutDetaching([$id]);
        }
        return redirect()->back(303);
    }

    // public function getArtist($id){
    //     return response()->json(Artist::find($id));
    // }

    public function getArtistAlbums($id)
    {
        $albums = $this->artistPage->albumsForArtist($id);
        return response()->json($albums);
    }

    public function unfollow(string $id): RedirectResponse
    {
        Artist::findOrFail($id);

        $user = auth()->user();
        if ($user) {
            $user->artists()->detach($id);
        }
        return redirect()->back(303);
    }
    
    /**
     * @unauthenticated
     */
    public function getArtist(int $id)
    {
        return new ArtistResource(Artist::findOrFail($id));
    }

    /**
     * @unauthenticated
     */
    public function getAllArtists()
    {
        return ArtistResource::collection(Artist::paginate());
    }
}
