<?php

namespace App\Http\Controllers;

use App\Http\Resources\PlaylistResource;
use App\Models\Playlist;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    public function getPlaylist(int $id)
    {
        return new PlaylistResource(Playlist::findOrFail($id));
    }

    public function createPlaylist(Request $request)
    {
        return response(status: 501);
    }

    public function deletePlaylist(int $id)
    {
        return response(status: 501);
    }

    public function addSong(Request $request)
    {
        return response(status: 501);
    }

    public function removeSong(Request $request)
    {
        return response(status: 501);
    }
}
