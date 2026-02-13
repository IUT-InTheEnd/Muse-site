<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;

class UserController extends Controller
{
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

    public function getUserPageInformation(Request $request)
    {
        // Récupère les playlists publiques de l'utilisateur
        // Récupère les titres récemment écoutés par l'utilisateur
        // Récupère les artistes suivis par l'utilisateur
        // Vérifie si la page est publique ou privée et gère l'affichage en conséquence
        $validatedData = $request->validate([
            'user_id' => 'required|integer|exists:user,user_id',
        ]);

        if ($validatedData) {
            $user = User::find($request->user_id);
            if ($user & $user->public_profile_visibility) {
                $playlists = $user->possede_playlists()->where('playlist_public', true)->get();
                $recentTracks = $user->user_ecoutes()->latest()->take(10)->get();
                $followedArtists = $user->artists()->get();

                return response()->json([
                    'playlists' => $playlists,
                    'recent_tracks' => $recentTracks,
                    'followed_artists' => $followedArtists,
                ]);
            }

            return response()->json(['error' => 'Profile is private'], 403);
        }

        return response()->json(['error' => 'Invalid request'], 400);
    }
}
