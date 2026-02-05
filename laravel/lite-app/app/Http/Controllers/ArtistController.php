<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use Illuminate\Http\Request;
use Inertia\Inertia; 
use Inertia\Response;

class ArtistController extends Controller
{
    public function show(string $id): Response
    {
        $artist = Artist::findOrFail($id);
        return Inertia::render('artist', [
            'artist' => $artist
        ]);
    }
}
