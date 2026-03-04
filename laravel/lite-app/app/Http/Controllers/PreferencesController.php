<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Genre;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PreferencesController extends Controller
{
   
    public function index()
    {
        $genres = Genre::all()->map(function ($genre) {
            return [
                'id'    => $genre->genre_id,
                'name'  => $genre->genre_name,
                'image' => $genre->genre_image_file ?? 'https://images.unsplash.com/photo-1514525253361-bee8718a7439?q=80&w=500&auto=format&fit=crop',
            ];
        });

        $allArtists = Artist::all()->map(function ($artist) {
            return [
                'artist_id'         => $artist->artist_id,
                'artist_name'       => $artist->artist_name,
                'artist_image_file' => $artist->artist_image_file,
            ];
        });

        return Inertia::render('PreferenceForm', [
            'genres'     => $genres,
            'allArtists' => $allArtists,
        ]);
    }


    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Vous devez être connecté.');
        }

        $validated = $request->validate([
            'genres'      => 'required|array|min:3',
            'artists'     => 'required|array|min:3',
            'moments'     => 'array',
            'preferences' => 'string|nullable',
            'styles'      => 'string|nullable',
            'langues'     => 'array',
            'duree'       => 'string|nullable',
            'humeurs'     => 'array',
        ]);

        $user->genres()->sync($request->genres); 
        $user->artists()->sync($request->artists);


        $user->update([
            'listening_moments' => json_encode($request->moments),
            'music_style'       => $request->styles,
            'preferred_moods'   => json_encode($request->humeurs),
        ]);

        return redirect()->route('dashboard')->with('success', 'Préférences enregistrées !');
    }
}