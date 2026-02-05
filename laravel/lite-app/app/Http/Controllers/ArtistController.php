<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ArtistController extends Controller
{
    public function show(string $id): View{
        return view('artisteprofile',['artist' => Artist::findOrFail($id) ]);
    }
}
