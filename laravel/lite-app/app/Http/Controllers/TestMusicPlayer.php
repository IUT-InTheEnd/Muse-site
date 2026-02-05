<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TestMusicPlayer extends Controller
{
    public function playMusic(Request $request)
    {
        $validated = $request->validate([
            'id' => [
                'required',
                'integer',
                Rule::exists('track', 'track_id'),
            ],
        ]);

        if ($validated) {
            $musique = Track::find($request->id);
            if ($musique) {
                return response()->json(['url' => $musique->track_file,
                    'title' => $musique->track_title,
                    'artist' => $musique->realisers->map(fn ($r) => $r->artist->artist_name)->implode(', '),
                    'artwork' => $musique->track_image_file]);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }
}
