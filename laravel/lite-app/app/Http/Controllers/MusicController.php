<?php

namespace App\Http\Controllers;

use App\Services\ReactionService;
use App\Models\Track;
use App\Models\UserEcoute;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MusicController extends Controller
{
    public function __construct(private ReactionService $reactions) {}

    private function buildTrackPayload(Track $track, ?string $viewerReaction = null): array
    {
        $primaryArtist = $track->realisers->first()?->artist;
        $audioUrl = blank($track->track_file)
            ? asset('placeholders/audio-placeholder.mp3')
            : $track->track_file;

        return [
            'id' => $track->track_id,
            'url' => $audioUrl,
            'title' => $track->track_title,
            'artist' => $track->realisers
                ->map(fn ($realiser) => $realiser->artist?->artist_name)
                ->filter()
                ->implode(', '),
            'artistid' => $primaryArtist?->artist_id,
            'artwork' => $track->track_image_file,
            'likes' => $track->track_likes ?? 0,
            'dislikes' => $track->track_dislikes ?? 0,
            'reaction' => $viewerReaction,
        ];
    }

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
                $musique->loadMissing('realisers.artist');
                $reactions = $this->reactions->trackReactionsFor($request, [$musique->track_id]);

                return response()->json($this->buildTrackPayload(
                    $musique,
                    $reactions[$musique->track_id] ?? null,
                ));
            }
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }

    public function playMusicBatch(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'string', 'regex:/^\d+(,\d+)*$/'],
        ]);

        $ids = array_values(array_unique(array_filter(
            array_map('intval', explode(',', $validated['ids'])),
            fn ($id) => $id > 0,
        )));

        if (empty($ids)) {
            return response()->json(['error' => 'No valid IDs provided'], 400);
        }

        $tracks = Track::whereIn('track_id', $ids)
            ->with('realisers.artist')
            ->get()
            ->keyBy('track_id');
        $reactions = $this->reactions->trackReactionsFor($request, $ids);

        $result = [];
        foreach ($ids as $id) {
            $musique = $tracks->get($id);
            if (! $musique) {
                continue;
            }

            $result[] = $this->buildTrackPayload(
                $musique,
                $reactions[$id] ?? null,
            );
        }

        return response()->json($result);
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
