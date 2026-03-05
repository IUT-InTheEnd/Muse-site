<?php

namespace App\Http\Controllers;

<<<<<<< api
use App\Enums\Instruments;
use App\Enums\ListeningContext;
use App\Http\Resources\UserResource;
use App\Models\User;
use Dedoc\Scramble\Attributes\ExcludeRouteFromDocs;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    #[ExcludeRouteFromDocs]
    public function debugCreateToken(string $id, string $name)
    {
        return User::findOrFail($id)->createToken($name)->plainTextToken;
    }

    public function getUser(Request $request)
    {
        return new UserResource($request->user());
=======
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;
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
>>>>>>> main
    }

    public function updateUserInfo(Request $request)
    {
        $user = auth()->user();

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

        foreach (['user_instruments', 'user_music_contexts'] as $field) {
            if (! array_key_exists($field, $validatedData)) {
                $validatedData[$field] = null;
            }
        }

        $stringify = function (string $s): string {
            return "'".$s."'";
        };

        $user->user_age = $validatedData['user_age'] ?? $user->user_age;
        $user->user_job = $validatedData['user_job'] ?? $user->user_job;
        $user->user_gender = $validatedData['user_gender'] ?? $user->user_gender;
        if (! is_null($validatedData['user_instruments'])) {
            $instrumentString = '['.implode(', ', array_map($stringify, $validatedData['user_instruments'])).']';
            $user->user_instruments = $instrumentString;
        }

        if (! is_null($validatedData['user_music_contexts'])) {
            $contextString = '['.implode(', ', array_map($stringify, $validatedData['user_music_contexts'])).']';
            $user->user_music_contexts = $contextString;
        }
        $user->user_plays_music = $validatedData['user_plays_music'] ?? $user->user_plays_music;
        $user->save();

        return new UserResource($user);
    }
}
