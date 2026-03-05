<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Track;
use App\Models\Album;
use App\Models\Realiser;
use App\Models\Artist;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function view(Request $request)
    {
        $search = $request->input('q');

        $tracks = Track::query()
            ->select('track_id', 'track_title','track_image_file','track_listens','track_favorites','track_duration')
            ->where('track_title','ilike',"%{$search}%")
            ->orderBy('track_id') 
            ->limit(100)
            ->get();

        for ($i=0; $i < count($tracks); $i++) { 
            $temp = Realiser::where('track_id', $tracks[$i]['track_id'] )->get();

            $tracks[$i]->artist = Artist::find($temp[0]['artist_id']);
        }

        return Inertia::render('search', [
            'listeMusiques' => $tracks,
            'filters' => [
                'q' => $search,
            ],
        ]);
    }   
}   
