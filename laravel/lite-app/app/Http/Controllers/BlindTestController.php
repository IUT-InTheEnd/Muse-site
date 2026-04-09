<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Services\BlindTestSessionService;
use App\Services\PlaylistTrackService;
use App\Services\RecommendationService;
use App\Services\SearchQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\Process\Exception\ProcessFailedException;

class BlindTestController extends Controller
{
    public function __construct(
        private RecommendationService $recommendations,
        private SearchQueryService $searchQueries,
        private PlaylistTrackService $playlistTracks,
        private BlindTestSessionService $blindTests,
    ) {}

    public function create(Request $request)
    {
        return Inertia::render('blind-tests/new', [
            'genres' => $this->searchQueries->allGenres()
                ->map(fn ($genre) => [
                    'id' => $genre->genre_id,
                    'title' => $genre->genre_title,
                    'parent_id' => $genre->genre_parent_id,
                    'top_level' => (bool) $genre->top_level,
                ])
                ->values(),
            'languages' => $this->searchQueries->languages()
                ->map(fn ($language) => [
                    'id' => $language->language_id,
                    'label' => $language->language_label,
                    'code' => $language->language_code,
                ])
                ->values(),
            'generationConfig' => [
                'popularities' => [
                    ['value' => 'low', 'label' => 'Faible'],
                    ['value' => 'medium', 'label' => 'Moyenne'],
                    ['value' => 'high', 'label' => 'Forte'],
                ],
                'vocalTypes' => [
                    ['value' => 'indifferent', 'label' => 'Indifférent'],
                    ['value' => 'instrumental', 'label' => 'Instrumental'],
                    ['value' => 'spoken', 'label' => 'Spoken'],
                ],
            ],
        ]);
    }

    public function searchArtists(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'nullable|string|max:255',
        ]);

        $query = trim((string) ($validated['q'] ?? ''));
        if ($query === '') {
            return response()->json([
                'artists' => [],
            ]);
        }

        $artists = $this->searchQueries->artists($query)->map(fn ($artist) => [
            'id' => $artist->artist_id,
            'name' => $artist->artist_name,
            'image' => $artist->artist_image_file,
        ])->values();

        return response()->json([
            'artists' => $artists,
        ]);
    }

    public function generate(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'count' => 'required|integer|min:1|max:50',
            'save_playlist' => 'required|boolean',
            'playlist_name' => 'nullable|string|max:255',
            'playback' => 'nullable|array',
            'playback.difficulty' => 'nullable|string|in:facile,moyen,dur',
            'filters' => 'nullable|array',
            'filters.year_min' => 'nullable|integer',
            'filters.year_max' => 'nullable|integer',
            'filters.genre_ids' => 'nullable|array',
            'filters.genre_ids.*' => 'integer|exists:genre,genre_id',
            'filters.artist_ids' => 'nullable|array',
            'filters.artist_ids.*' => 'integer|exists:artist,artist_id',
            'filters.popularity' => 'nullable|string|in:low,medium,high',
            'filters.vocal_type' => 'nullable|string|in:indifferent,instrumental,spoken',
            'filters.language_ids' => 'nullable|array',
            'filters.language_ids.*' => 'integer|exists:language,language_id',
        ]);

        $validator->after(function ($validator) use ($request): void {
            $yearMin = $request->input('filters.year_min');
            $yearMax = $request->input('filters.year_max');

            if ($yearMin !== null && $yearMin !== '' && $yearMax !== null && $yearMax !== '' && (int) $yearMax < (int) $yearMin) {
                $validator->errors()->add(
                    'filters.year_max',
                    'La valeur de filters.year max doit être supérieure ou égale à filters.year min.'
                );
            }
        });

        $validated = $validator->validate();

        $user = $request->user();
        $filters = $validated['filters'] ?? [];
        $playback = $this->blindTests->storePlayback($request->session(), $validated['playback'] ?? []);

        if ((bool) $validated['save_playlist'] && blank($validated['playlist_name'] ?? null)) {
            throw ValidationException::withMessages([
                'playlist_name' => 'Le nom de la playlist est obligatoire pour enregistrer la sélection.',
            ]);
        }

        try {
            $result = $this->recommendations->generateBlindTest($user->id, [
                'count' => (int) $validated['count'],
                'filters' => [
                    'year_min' => $filters['year_min'] ?? null,
                    'year_max' => $filters['year_max'] ?? null,
                    'genre_ids' => $filters['genre_ids'] ?? [],
                    'artist_ids' => $filters['artist_ids'] ?? [],
                    'popularity' => $filters['popularity'] ?? null,
                    'vocal_type' => $filters['vocal_type'] ?? 'indifferent',
                    'language_ids' => $filters['language_ids'] ?? [],
                ],
            ]);
        } catch (ProcessFailedException $exception) {
            throw ValidationException::withMessages([
                'count' => "Le moteur de génération a échoué : {$exception->getMessage()}",
            ]);
        } catch (\RuntimeException $exception) {
            throw ValidationException::withMessages([
                'count' => $exception->getMessage(),
            ]);
        }

        if (! empty($result['error'])) {
            throw ValidationException::withMessages([
                'count' => $result['error'],
            ]);
        }

        $trackIds = array_map('intval', $result['track_ids'] ?? []);
        if ($trackIds === []) {
            throw ValidationException::withMessages([
                'count' => 'Aucun morceau n’a pu être généré.',
            ]);
        }

        $generationMeta = [
            'count' => (int) $validated['count'],
            'filters' => [
                'year_min' => $filters['year_min'] ?? null,
                'year_max' => $filters['year_max'] ?? null,
                'genre_ids' => $filters['genre_ids'] ?? [],
                'artist_ids' => $filters['artist_ids'] ?? [],
                'popularity' => $filters['popularity'] ?? null,
                'vocal_type' => $filters['vocal_type'] ?? 'indifferent',
                'language_ids' => $filters['language_ids'] ?? [],
            ],
            'counts' => $result['counts'] ?? [],
            'playback' => $playback,
        ];

        if ((bool) $validated['save_playlist']) {
            $playlist = Playlist::create([
                'user_id' => $user->id,
                'playlist_name' => trim((string) $validated['playlist_name']),
                'playlist_date_created' => now(),
                'playlist_date_updated' => now(),
                'playlist_public' => false,
                'playlist_deletable' => true,
            ]);

            $this->playlistTracks->appendTracks($playlist, $trackIds);

            return redirect()->route('playlist.show', ['id' => $playlist->playlist_id]);
        }

        $this->blindTests->storeEphemeral($request->session(), $trackIds, $generationMeta);

        return redirect()->route('blind-tests.play.ephemeral');
    }

    public function playEphemeral(Request $request)
    {
        $ephemeral = $this->blindTests->getEphemeral($request->session());

        if (! $ephemeral) {
            return redirect()
                ->route('blind-tests.new')
                ->withErrors([
                    'blind_test' => 'La session blind test a expiré. Régénérez une sélection.',
                ]);
        }

        return Inertia::render('blind-tests/lecture', [
            'source' => 'ephemeral',
            'trackCount' => count($ephemeral['track_ids'] ?? []),
            'playlist' => null,
            'ephemeral' => [
                'generated_at' => $ephemeral['generated_at'] ?? null,
                'generation' => $ephemeral['generation'] ?? [],
            ],
        ]);
    }

    public function playPlaylist(Request $request, int $id)
    {
        $playlist = Playlist::with('tracks')->findOrFail($id);

        if (! $playlist->playlist_public && $playlist->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($playlist->tracks->isEmpty()) {
            return redirect()
                ->route('playlist.show', ['id' => $playlist->playlist_id])
                ->withErrors([
                    'blind_test' => 'Cette playlist est vide.',
                ]);
        }

        return Inertia::render('blind-tests/lecture', [
            'source' => 'playlist',
            'trackCount' => $playlist->tracks->count(),
            'playlist' => [
                'id' => $playlist->playlist_id,
                'name' => $playlist->playlist_name,
            ],
            'ephemeral' => null,
        ]);
    }

    public function musiqueGenererEphemeral(Request $request): JsonResponse
    {
        $ephemeral = $this->blindTests->getEphemeral($request->session());

        if (! $ephemeral) {
            return response()->json(['tracks' => []]);
        }

        $musiqueId = $ephemeral['track_ids'] ?? [];

        $tracksQuery = \App\Models\Track::with(['realisers.artist'])
            ->whereIn('track_id', $musiqueId)
            ->get()
            ->keyBy('track_id');

        $ordered = array_map(function ($id) use ($tracksQuery) {
            if (! isset($tracksQuery[$id])) {
                return null;
            }

            return $this->formatBlindTestTrackPayload($tracksQuery[$id]);
        }, $musiqueId);

        // filter out missing
        $ordered = array_values(array_filter($ordered));

        return response()->json(['tracks' => $ordered]);
    }

    public function playlistTracks(Request $request, int $id): JsonResponse
    {
        $playlist = Playlist::with(['tracks.realisers.artist'])->findOrFail($id);

        if (! $playlist->playlist_public && $playlist->user_id !== $request->user()->id) {
            abort(403);
        }

        $tracks = $playlist->tracks
            ->map(fn ($track) => $this->formatBlindTestTrackPayload($track))
            ->values();

        return response()->json([
            'tracks' => $tracks,
        ]);
    }

    private function formatBlindTestTrackPayload($track): array
    {
        $artist = null;
        $firstRealiser = $track->realisers->first();
        if ($firstRealiser && isset($firstRealiser->artist)) {
            $artistObj = $firstRealiser->artist;
            $artist = $artistObj->artist_name ?? null;
        }

        return [
            'id' => $track->track_id,
            'title' => $track->track_title,
            'artist' => $artist,
            'url' => $track->track_url ?? $track->track_file ?? null,
            'duration' => $track->track_duration ?? null,
            'cover' => $track->track_image_file ?? null,
        ];
    }
}
