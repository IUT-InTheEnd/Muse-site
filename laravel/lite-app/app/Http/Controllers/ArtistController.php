<?php

namespace App\Http\Controllers;

use App\Http\Resources\ArtistResource;
use App\Models\Artist;
use Illuminate\View\View;

class ArtistController extends Controller
{

    public function show(string $id): View
    {
        return view('artisteprofile', ['artist' => Artist::findOrFail($id)]);
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
