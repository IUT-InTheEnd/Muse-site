<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Track;
use App\Models\Realiser;
use App\Models\Artist;
use App\Models\Language;
use App\Models\Genre;
use App\Models\ArtisteChante;
use App\Models\TrackChanterEn;
use App\Models\ContientGenre;
use App\Services\ReactionService;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function __construct(private ReactionService $reactions) {}

    public function view(Request $request)
    {
        $search = $request->input('q');

        $selectedGenres = $request->input('genres', []);
        $selectedLangues = $request->input('langues', []);

        $listTrackFromGenre = array();
        $listTrackFromLanguage = array();
        $listArtistFromLanguage = array();

        if(count($selectedGenres) > 0){
            foreach ($selectedGenres as $key => $genre) {
                $selectedGenres[$key] = (int) $genre;
            }

            $listTrackFromGenre = ContientGenre::query()
                ->select('track_id')
                ->whereIn('genre_id', $selectedGenres)
                ->get();
        }

        if(count($selectedLangues) > 0){
            foreach ($selectedLangues as $key => $langue) {
                $selectedLangues[$key] = (int) $langue;
            }

            $listTrackFromLanguage = TrackChanterEn::query()
                ->select('track_id')
                ->whereIn('language_id', $selectedLangues)
                ->get();

            $listArtistFromLanguage = ArtisteChante::query()
                ->select('artist_id')
                ->whereIn('language_id', $selectedLangues)
                ->get();
        }

        if((count($selectedLangues) > 0) && (count($selectedGenres) > 0)){
            $listTracksFromBoth = $listTrackFromGenre->merge($listTrackFromLanguage)->unique('track_id')->values();
        }
        
        if((count($selectedLangues) > 0) && (count($selectedGenres) == 0)){
            $listTracksFromBoth = $listTrackFromLanguage;
        }

        if((count($selectedLangues) == 0) && (count($selectedGenres) > 0)){
            $listTracksFromBoth = $listTrackFromGenre;
        }

        if((count($selectedLangues) == 0) && (count($selectedGenres) == 0)){
            $listTracksFromBoth = [];
        }

        $tracks = Track::query()
            ->select('track_id', 'track_title','track_image_file','track_listens','track_favorites','track_likes','track_dislikes','track_duration')
            ->where('track_title','ilike',"%{$search}%");

        if(count($listTracksFromBoth) > 0){
            $tracks = $tracks->whereIn('track_id', $listTracksFromBoth);
        }

        $tracks = $tracks
            ->orderBy('track_listens', 'desc')
            ->limit(100)
            ->get();

        $artists = Artist::query()
            ->select('artist_id', 'artist_name', 'artist_image_file')
            ->where('artist_name', 'ilike', "%{$search}%");

        if(count($listArtistFromLanguage) > 0){
            $artists = $artists->whereIn('artist_id', $listArtistFromLanguage);
        }

        $artists = $artists
            ->orderBy('artist_id')
            ->limit(100)
            ->get();

        $languages = Language::query()
            ->select('language_id','language_label')
            ->orderBy('language_label')
            ->distinct()
            ->get();

        $genres = Genre::query()
            ->select('genre_id','genre_title')
            ->where('genre_parent_id', null)
            ->orderBy('genre_title')
            ->distinct()
            ->get();

        for ($i=0; $i < count($tracks); $i++) { 
            $temp = Realiser::where('track_id', $tracks[$i]['track_id'] )->get();

            $tracks[$i]->artist = Artist::find($temp[0]['artist_id']);
        }

        $trackReactions = $this->reactions->trackReactionsFor($request, $tracks->pluck('track_id'));

        return Inertia::render('search', [
            'listeMusiques' => $tracks,
            'listeArtistes' => $artists,
            'langues' => $languages,
            'genres' => $genres,
            'testGenres' => $request->input('genres', []),
            'testLangues' => $request->input('langues', []),
            'filters' => [
                'q' => $search,
            ],
            'trackReactions' => $trackReactions,
        ]);
    }   
}   
