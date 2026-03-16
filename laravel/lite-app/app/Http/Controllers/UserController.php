<?php

namespace App\Http\Controllers;

use App\Enums\Instruments;
use App\Enums\ListeningContext;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserInfoUpdater;
use Dedoc\Scramble\Attributes\ExcludeRouteFromDocs;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function show(string $username)
    {
        $user = User::where('name', $username)->firstOrFail();

        // Vérifie si le profil est public
        $isOwner = auth()->id() === $user->id;
        if ($user->user_privacy && ! $user->user_privacy->public_profile_visibility && ! $isOwner) {
            abort(403, 'Profile is private');
        }

        // Si c'est le propriétaire, affiche toutes les playlists, sinon seulement les publiques
        $playlists = $isOwner
            ? $user->playlists()->withCount('tracks')->get()
            : $user->playlists()->where('playlist_public', true)->withCount('tracks')->get();

        $recentTracks = $user->user_ecoutes()->with('track.realisers.artist')->latest('last_listen')->take(10)->get();
        $followedArtists = $user->artists()->get();

        // Récupère les IDs des pistes favorites de l'utilisateur connecté (on veut montrer les favoris du de l'utilisateur qui visite la page, pas du propriétaire du profil)
        $authUser = auth()->user();
        $favoriteTrackIds = $authUser ? $authUser->getFavoriteTrackIds() : [];
        $userPlaylists = $authUser ? $authUser->playlists()->get(['playlist_id', 'playlist_name', 'playlist_image_file']) : [];

        return Inertia::render('user/profile', [
            'user' => $user,
            'playlists' => $playlists,
            'recent_tracks' => $recentTracks,
            'followed_artists' => $followedArtists,
            'favorite_track_ids' => $favoriteTrackIds,
            'user_playlists' => $userPlaylists,
            'is_owner' => $isOwner,
        ]);
    }

    #[ExcludeRouteFromDocs]
    public function debugCreateToken(string $id, string $name)
    {
        return User::findOrFail($id)->createToken($name)->plainTextToken;
    }

    public function createToken(int $id)
    {
        return User::findOrFail($id)->createToken('api_token')->plainTextToken;
    }

    public function regenerateToken(Request $request)
    {
        $user = User::findOrFail($request->user()->id);
        $user->tokens()->delete();
        return json_encode(['token' => $this->createToken($request->user()->id)]);
    }

    public function getUser(Request $request)
    {
        return new UserResource($request->user());
    }

    public function updateUserInfo(Request $request, UserInfoUpdater $updater): RedirectResponse
    {
        $this->updateUserInfoApi($request, $updater);

        return redirect()->back(303);
    }

    public function updateUserInfoApi(Request $request, UserInfoUpdater $updater): UserResource
    {
        $validatedData = $request->validate([
            'user_age' => 'nullable|numeric|between:0,200',
            'user_job' => 'nullable|string|max:255',
            'user_gender' => 'nullable|string|max:255',
            'user_plays_music' => 'nullable|boolean',
            'user_instruments' => 'nullable|list',
            'user_instruments.*' => [Rule::enum(Instruments::class)],
            'user_music_contexts' => 'nullable|list',
            'user_music_contexts.*' => [Rule::enum(ListeningContext::class)],
        ]);

        return new UserResource($updater->update($request->user(), $validatedData));
    }
}
