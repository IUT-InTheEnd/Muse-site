<?php

namespace App\Http\Controllers;

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
        if ($user->user_privacy && ! $user->user_privacy->public_profile_visibility && auth()->id() !== $user->id) {
            abort(403, 'Profile is private');
        }

        $playlists = $user->playlists()->where('playlist_public', true)->get();
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
        ]);
    }

    public function updateUserInfo(Request $request)
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'user_age' => 'nullable|numeric|between:0,200',
            'user_job' => 'nullable|string|max:255',
            'user_gender' => 'nullable|string|max:255',
            'user_plays_music' => 'nullable|string|max:255',
            'user_instruments' => 'nullable|string|max:1000',
            'user_music_contexts' => 'nullable|string|max:1000',
        ]);

        $user->user_age = $validatedData['user_age'] ?? $user->user_age;
        $user->user_job = $validatedData['user_job'] ?? $user->user_job;
        $user->user_gender = $validatedData['user_gender'] ?? $user->user_gender;
        $user->user_plays_music = $validatedData['user_plays_music'] ?? $user->user_plays_music;
        $user->user_instruments = $validatedData['user_instruments'] ?? $user->user_instruments;
        $user->user_music_contexts = $validatedData['user_music_contexts'] ?? $user->user_music_contexts;
        $user->save();

        return back();
    }

    public function updateUserProfile(Request $request)
    {
        $user = auth()->user();

        $validatedData = $request->validate([
            'music_envy_today' => 'nullable|string|max:255',
            'feeling' => 'nullable|integer|between:0,10',
            'music_preference' => 'nullable|integer|between:0,10',
            'music_style_preference' => 'nullable|integer|between:0,10',
            'music_reason' => 'nullable|string|max:255',
            'listening_context' => 'nullable|string|max:255',
            'current_music_type' => 'nullable|integer|between:0,10',
            'usual_listening_mode' => 'nullable|integer|between:0,10',
            'likes_discovery' => 'nullable|integer|between:0,10',
            'attend_live_concert' => 'nullable|integer|between:0,10',
            'repeat_listening' => 'nullable|integer|between:0,10',
            'explicit_ok' => 'nullable|integer|between:0,1',
            'avg_song_length' => 'nullable|numeric|min:0',
            'avg_daily_listen_time' => 'nullable|numeric|min:0',
            'recommanded_artists' => 'nullable|string|max:1000',
        ]);

        $profile = $user->user_profile;

        if (! $profile) {
            $profile = new UserProfile;
            $profile->fill($validatedData);
            $profile->save();

            $user->profile_id = $profile->user_profile_id;
            $user->save();
        } else {
            $profile->fill($validatedData);
            $profile->save();
        }

        return back();
    }
}
