<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Models\UserEcoute;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MusicController extends Controller
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
                $musiquedef = $musique->track_file;
                if ($musique->track_file === '') {
                    $musiquedef = asset('placeholders/audio-placeholder.mp3');
                }

                return response()->json(['url' => $musiquedef,
                    'title' => $musique->track_title,
                    'artist' => $musique->realisers->map(fn ($r) => $r->artist->artist_name)->implode(', '),
                    'artwork' => $musique->track_image_file]);
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }

    public function addListen(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'track_id' => [
                'required',
                'integer',
                Rule::exists('track', 'track_id'),
            ],
        ]);

        $track = Track::where('track_id', $validated['track_id'])->first();
        if (! $track) {
            return response()->json(['error' => 'Track not found'], 404);
        }

        $userEcoute = UserEcoute::where('user_id', $user->id)
            ->where('track_id', $validated['track_id'])
            ->first();

        if ($userEcoute) {
            UserEcoute::where('user_id', $user->id)
                ->where('track_id', $validated['track_id'])
                ->update([
                    'nb_ecoute' => ($userEcoute->nb_ecoute ?? 0) + 1,
                    'last_listen' => now(),
                ]);
        } else {
            UserEcoute::create([
                'user_id' => $user->id,
                'track_id' => $validated['track_id'],
                'nb_ecoute' => 1,
                'last_listen' => now(),
            ]);
        }

        $track->track_listens = ($track->track_listens ?? 0) + 1;
        $track->save();

        return response()->json(['message' => 'Listen added successfully']);
    }
}
