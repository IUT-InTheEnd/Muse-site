<?php

namespace App\Http\Controllers;

use App\Http\Resources\TrackResource;
use App\Models\Track;

class TrackController extends Controller
{
    /**
     * @unauthenticated
     */
    public function getAllTracks()
    {
        return TrackResource::collection(Track::paginate());
    }

    /**
     * @unauthenticated
     */
    public function getTrack(int $id)
    {
        return new TrackResource(Track::findOrFail($id));
    }
}
