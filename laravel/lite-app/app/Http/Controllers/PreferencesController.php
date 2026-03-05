<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Genre;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PreferencesController extends Controller
{
   
    public function index()
    {
        $genres = Genre::all()->map(function ($genre) {
            return [
                'id'    => $genre->genre_id,
                'name'  => $genre->genre_title,
                'color' => $genre->genre_color 
            ];
        });

        $allArtists = Artist::all()->map(function ($artist) {
            return [
                'artist_id'         => $artist->artist_id,
                'artist_name'       => $artist->artist_name,
                'artist_image_file' => $artist->artist_image_file
            ];
        });

        return Inertia::render('preferences', [
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

        $request->validate([
            'genres'      => 'required|array|min:3',
            'artists'     => 'required|array|min:3',
            'moments'     => 'array',
            'styles'      => 'string|nullable',
            'humeurs'     => 'array',
        ]);

        DB::transaction(function () use ($request, $user) {
            $user->artists()->sync($request->artists);
            $genreIds = Genre::whereIn('genre_title', $request->genres)
                            ->pluck('genre_id');

            $user->ajoute_genre_favoris()->delete();

            foreach ($genreIds as $id) {
                $user->ajoute_genre_favoris()->create([
                    'genre_id' => $id,
                ]);
            }

            $user->update([
                'listening_moments' => json_encode($request->moments),
                'music_style'       => $request->styles,
                'preferred_moods'   => json_encode($request->humeurs),
            ]);
        });

        return redirect()->route('dashboard')->with('success', 'Préférences enregistrées !');
    }
}