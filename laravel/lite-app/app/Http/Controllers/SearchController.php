<?php

namespace App\Http\Controllers;

use App\Services\ReactionService;
use App\Services\SearchQueryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function __construct(
        private ReactionService $reactions,
        private SearchQueryService $searchQueries,
    ) {}

    public function view(Request $request)
    {
        $search = $request->input('q');
        $selectedGenres = $request->input('genres', []);
        $selectedLangues = $request->input('langues', []);
        $tracks = $this->searchQueries->tracks($search, $selectedGenres, $selectedLangues);
        $artists = $this->searchQueries->artists($search, $selectedLangues);
        $languages = $this->searchQueries->languages();
        $genres = $this->searchQueries->rootGenres();

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
