<?php

namespace App\Http\Controllers;

use App\Http\Resources\ArtistResource;
use App\Models\Artist;
use App\Models\Track;
use App\Models\Album;
use App\Models\Realiser;
use App\Services\ReactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia; 


class ArtistController extends Controller
{
    public function __construct(private ReactionService $reactions) {}

    public function show(Request $request, string $id)
    {
        $artist = Artist::findOrFail($id);

        $user = auth()->user();
        $isFollowing = false;
        if ($user) {
            $isFollowing = $user->artists()
                ->where('artist.artist_id', $id)
                ->exists();
        }

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
                'favorites' => $track->track_favorites,
                'likes' => $track->track_likes,
                'dislikes' => $track->track_dislikes,
                'listens' => $track->track_listens,
                'date' => $track->track_date_created ?? ""
            ];
        });

        $albums = $this->albumsForArtist($id);
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
        $artist = Artist::findOrFail($id);

        $albumIds = Realiser::where('artist_id', $id)
                    ->pluck('album_id')
            ->unique()
            ->filter()
            ->toArray();

        $albums = Album::whereIn('album_id', $albumIds)
            ->get()
            ->map(function ($album) {
                $realisers = Realiser::where('album_id', $album->album_id)
                    ->with('track', 'artist')
                    ->get();

                $albumTracks = $realisers->map(function ($realiser) {
                    return [
                        'id'       => $realiser->track->track_id,
                        'title'    => $realiser->track->track_title,
                        'url'      => $realiser->track->track_file,
                        'artwork'  => $realiser->track->track_image_file, 
                        'duration' => $realiser->track->track_duration,
                        'listens' => $realiser->track->track_listens,
                        'favorites' => $realiser->track->track_favorites,
                        'likes' => $realiser->track->track_likes,
                        'dislikes' => $realiser->track->track_dislikes,
                        'date' => $realiser->track->track_date_created ?? "",
                        'artist' => [
                            'id' => $realiser->artist->artist_id,
                            'name' => $realiser->artist->artist_name,
                        ]
                    ];
                })->toArray();

                return [
                    'id' => $album->album_id,
                    'title' => $album->album_title,
                    'date' => $album->album_date_created ?? "",
                    'type' => $album->album_type,
                    'artwork' => $album->album_image_file,
                    'tracks' => $albumTracks,
                ];
            });

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

    private function albumsForArtist(string $artistId)
    {
        $albumIds = Realiser::where('artist_id', $artistId)
                    ->pluck('album_id')
                    ->unique()
                    ->filter()
                    ->toArray();

        return Album::whereIn('album_id', $albumIds)
            ->orderBy('album_date_created', 'desc')
            ->get()
            ->map(function ($album) {
                return [
                    'id' => $album->album_id,
                    'title' => $album->album_title,
                    'date' => $album->album_date_created ? $album->album_date_created->toDateString() : null,
                    'type' => $album->album_type,
                    'artwork' => $album->album_image_file,
                ];
            });
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
        $albums = $this->albumsForArtist($id);
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
