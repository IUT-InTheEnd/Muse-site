<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Track;
use App\Models\Album;
use App\Models\Realiser;
use Inertia\Inertia; 
use Illuminate\Support\Facades\DB;


class ArtistController extends Controller
{
    public function show(string $id)
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
                'listens' => $track->track_listens,
                'date' => $track->track_date_created ?? ""
            ];
        });

        $albums = $this->albumsForArtist($id);

        return Inertia::render('artists/artist', [
            'artist' => $artist,
            'tracks' => $tracks, 
            'albums' => $albums,
            'isFollowing' => $isFollowing,
        ]);
    }
    
    public function allTracks(string $id)
    {
        $artist = Artist::findOrFail($id);

        $tracks = Track::whereHas('realisers', function ($query) use ($id) {
            $query->where('artist_id', $id);
        })
        ->with('realisers') 
        ->get();

        $albumIds = Realiser::where('artist_id', $id)
                    ->pluck('album_id')
            ->unique()
            ->filter()
            ->toArray();

        $albums = Album::whereIn('album_id', $albumIds)
            ->get()
            ->map(function ($album) use ($tracks) {
                $albumTracks = [];
                
                foreach ($tracks as $track) {
                    $trackInAlbum = $track->realisers
                        ->where('album_id', $album->album_id)
                        ->where('artist_id', $album->album_id !== null)
                        ->first();
                    
                    if ($trackInAlbum) {
                        $albumTracks[] = [
                            'id'       => $track->track_id,
                            'title'    => $track->track_title,
                            'url'      => $track->track_file,
                            'artwork'  => $track->track_image_file, 
                            'duration' => $track->track_duration,
                            'listens' => $track->track_listens,
                            'date' => $track->track_date_created ?? ""
                        ];
                    }
                }
                
                return [
                    'id' => $album->album_id,
                    'title' => $album->album_title,
                    'date' => $album->album_date_created ?? "",
                    'type' => $album->album_type,
                    'artwork' => $album->album_image_file,
                    'tracks' => $albumTracks,
                ];
            });

        return Inertia::render('artists/all_tracks', [
            'artist' => $artist,
            'albums' => $albums,
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

    public function follow(string $id)
    {
        $user = auth()->user();
        if ($user) {
            $user->artists()->syncWithoutDetaching([$id]);
        }
        return response()->json(['success' => true]);
    }

    public function getArtist($id){
        return response()->json(Artist::find($id));
    }

    public function getArtistAlbums($id)
    {
        $albums = $this->albumsForArtist($id);
        return response()->json($albums);
    }

    public function unfollow(string $id)
    {
        $user = auth()->user();
        if ($user) {
            $user->artists()->detach($id);
        }
        return response()->json(['success' => true]);
    }

}