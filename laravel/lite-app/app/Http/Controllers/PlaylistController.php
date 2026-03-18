<?php

namespace App\Http\Controllers;

use App\Http\Resources\PlaylistResource;
use App\Models\Playlist;
use App\Services\PlaylistQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlaylistController extends Controller
{
    public function __construct(private PlaylistQueryService $playlists) {}

    // Récupère toute les playlists d'un utilisateur (exclut la playlist de favoris)
    public function getUserPlaylists(): JsonResponse
    {
        $user = auth()->user();
        $playlists = $this->playlists->userEditablePlaylists($user);

        return response()->json([
            'playlists' => $playlists,
        ]);
    }

    // Récupère les playlists d'un utilisateur avec l'info si un track est dans chaque playlist
    public function getUserPlaylistsForTrack(Request $request): JsonResponse
    {
        $request->validate([
            'track_id' => 'required|integer|exists:track,track_id',
        ]);

        $user = auth()->user();
        $trackId = $request->input('track_id');
        $playlists = $this->playlists->userEditablePlaylistsForTrack($user, $trackId);

        return response()->json([
            'playlists' => $playlists,
        ]);
    }

    // Synchronise un track avec plusieurs playlists (ajoute/retire selon les checkboxes)
    public function syncTrackPlaylists(Request $request): JsonResponse
    {
        $request->validate([
            'track_id' => 'required|integer|exists:track,track_id',
            'playlist_ids' => 'present|array',
            'playlist_ids.*' => 'integer|exists:playlist,playlist_id',
        ]);

        $user = auth()->user();
        $trackId = $request->input('track_id');
        $selectedPlaylistIds = $request->input('playlist_ids', []);

        // Récupérer toutes les playlists de l'utilisateur (sauf favoris)
        $userPlaylists = $this->playlists->userEditablePlaylists($user, ['playlist_id']);

        foreach ($userPlaylists as $playlist) {
            $isSelected = in_array($playlist->playlist_id, $selectedPlaylistIds);
            $hasTrack = $this->playlists->playlistContainsTrack($playlist, $trackId);

            if ($isSelected && ! $hasTrack) {
                // Ajouter le track à la playlist
                $playlist->tracks()->attach($trackId);
                $playlist->playlist_date_updated = now();
                $playlist->save();
            } elseif (! $isSelected && $hasTrack) {
                // Retirer le track de la playlist
                $playlist->tracks()->detach($trackId);
                $playlist->playlist_date_updated = now();
                $playlist->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Playlists mises à jour',
        ]);
    }

    // Crée une nouvelle playlist et peut ajouter un track à la création
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'track_id' => 'nullable|integer|exists:track,track_id',
        ]);

        $user = auth()->user();

        $playlist = Playlist::create([
            'user_id' => $user->id,
            'playlist_name' => $request->input('name'),
            'playlist_date_created' => now(),
            'playlist_date_updated' => now(),
            'playlist_public' => false,
            'playlist_deletable' => true,
        ]);

        // Si un track_id est fourni, l'ajouter a la playlist
        if ($request->has('track_id') && $request->input('track_id')) {
            $playlist->tracks()->attach($request->input('track_id'));
        }

        return response()->json([
            'success' => true,
            'playlist' => $playlist,
            'message' => 'Playlist creee avec succes',
        ]);
    }

    // Supprime une playlist (seules les playlists supprimables peuvent être supprimées)
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'playlist_id' => 'required|integer|exists:playlist,playlist_id',
        ]);

        $user = auth()->user();
        $playlist = $this->playlists->userOwnedPlaylist($user, $request->input('playlist_id'), true);

        if (! $playlist) {
            return response()->json([
                'success' => false,
                'message' => 'Playlist non trouvee ou non supprimable',
            ], 404);
        }

        $playlist->tracks()->detach();
        $playlist->delete();

        return response()->json([
            'success' => true,
            'message' => 'Playlist supprimee',
        ]);
    }

    // Met à jour les informations d'une playlist (nom, description, public)
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'playlist_id' => 'required|integer|exists:playlist,playlist_id',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'public' => 'nullable|boolean',
        ]);

        $user = auth()->user();
        $playlist = $this->playlists->userOwnedPlaylist($user, $request->input('playlist_id'));

        if (! $playlist) {
            return response()->json([
                'success' => false,
                'message' => 'Playlist non trouvee',
            ], 404);
        }

        if ($request->has('name')) {
            $playlist->playlist_name = $request->input('name');
        }
        if ($request->has('description')) {
            $playlist->playlist_description = $request->input('description');
        }
        if ($request->has('public')) {
            $playlist->playlist_public = $request->input('public');
        }

        $playlist->playlist_date_updated = now();
        $playlist->save();

        return response()->json([
            'success' => true,
            'playlist' => $playlist,
            'message' => 'Playlist mise a jour',
        ]);
    }

    // Ajoute un track à une playlist
    public function addTrack(Request $request): JsonResponse
    {
        $request->validate([
            'playlist_id' => 'required|integer|exists:playlist,playlist_id',
            'track_id' => 'required|integer|exists:track,track_id',
        ]);

        $user = auth()->user();
        $playlist = $this->playlists->userOwnedPlaylist($user, $request->input('playlist_id'));

        if (! $playlist) {
            return response()->json([
                'success' => false,
                'message' => 'Playlist non trouvee',
            ], 404);
        }

        // Verifier si le track n'est pas deja dans la playlist
        if ($this->playlists->playlistContainsTrack($playlist, $request->input('track_id'))) {
            return response()->json([
                'success' => false,
                'message' => 'Ce titre est deja dans la playlist',
            ], 400);
        }

        $playlist->tracks()->attach($request->input('track_id'));
        $playlist->playlist_date_updated = now();
        $playlist->save();

        return response()->json([
            'success' => true,
            'message' => 'Titre ajoute a la playlist',
        ]);
    }

    // Retire un track d'une playlist
    public function removeTrack(Request $request): JsonResponse
    {
        $request->validate([
            'playlist_id' => 'required|integer|exists:playlist,playlist_id',
            'track_id' => 'required|integer|exists:track,track_id',
        ]);

        $user = auth()->user();
        $playlist = $this->playlists->userOwnedPlaylist($user, $request->input('playlist_id'));

        if (! $playlist) {
            return response()->json([
                'success' => false,
                'message' => 'Playlist non trouvee',
            ], 404);
        }

        $playlist->tracks()->detach($request->input('track_id'));
        $playlist->playlist_date_updated = now();
        $playlist->save();

        return response()->json([
            'success' => true,
            'message' => 'Titre retire de la playlist',
        ]);
    }

    // Affiche une playlist avec tous ses titres et les infos associées
    public function show($id)
    {
        $playlist = $this->playlists->playlistForShow($id);

        return Inertia::render('playlist/show', [
            'playlist' => $playlist,
        ]);
    }

    // toute les playlists d'un utilisateur pour la page de gestion des playlists
    public function myPlaylists()
    {
        $user = auth()->user();
        $playlists = $this->playlists->userPlaylistsForManagement($user);

        return Inertia::render('playlist/index', [
            'playlists' => $playlists,
        ]);
    }

    public function getPlaylist(int $id)
    {
        $user = auth()->user()->id;
        $playlist = Playlist::findOrFail($id);
        if (! $playlist->playlist_public && $playlist->user_id !== auth()->user()->id) {
            return response(status: 403);
        }
        return new PlaylistResource($playlist);
    }
}
