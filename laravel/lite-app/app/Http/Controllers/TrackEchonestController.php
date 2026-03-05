<?php

namespace App\Http\Controllers;

use App\Http\Resources\TrackEchonestResource;
use App\Models\TrackEchonest;
use Dedoc\Scramble\Attributes\Group;

#[Group('Track')]
class TrackEchonestController extends Controller
{
    /**
     * @unauthenticated
     */
    public function getEchonest(int $id)
    {
        return new TrackEchonestResource(TrackEchonest::findOrFail($id));
    }
}
