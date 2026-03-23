<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdministratorController extends Controller
{
    public function createUser(): RedirectResponse
    {
        $validated = request()->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('user', 'name')],
            'email' => ['required', 'email', 'max:255', Rule::unique('user', 'email')],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'user_job' => 'nullable|string|max:255',
            'user_gender' => 'nullable|string|max:50',
            'user_age' => 'nullable|numeric|min:0|max:150',
        ], [
            'name.required' => 'Le nom est requis.',
            'name.unique' => 'Ce nom est déjà utilisé.',
            'email.required' => 'L\'email est requis.',
            'email.email' => 'L\'email doit être valide.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'password.required' => 'Le mot de passe est requis.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
        ]);

        DB::transaction(function () use ($validated): void {
            $userProfile = UserProfile::create([
                'music_envy_today' => '',
                'feeling' => 0,
                'music_preference' => 0,
                'music_style_preference' => 0,
                'music_reason' => '',
                'listening_context' => '',
                'usual_listening_mode' => 0,
                'likes_discovery' => 0,
                'attend_live_concert' => 0,
                'repeat_listening' => 0,
                'explicit_ok' => 0,
                'avg_song_length' => 0.0,
                'avg_daily_listen_time' => 0.0,
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'profile_id' => $userProfile->user_profile_id,
                'user_job' => $validated['user_job'] ?? null,
                'user_gender' => $validated['user_gender'] ?? null,
                'user_age' => isset($validated['user_age']) ? (float) $validated['user_age'] : null,
            ]);

            $user->user_privacy()->create([
                'public_profile_visibility' => true,
            ]);
        });

        return back()->with('success', 'Utilisateur créé avec succès.');
    }

    public function show(): Response
    {
        // recupere tout les colonnes de la table user pour les afficher dans le tableau d'administration
        $users = User::query()
            ->select(['id', 'name', 'email', 'id_role', 'created_at', 'updated_at','user_job','user_plays_music','user_gender','user_instruments','user_music_contexts','profile_id','user_image_file', 'user_age', 'two_factor_secret', 'two_factor_confirmed_at'])
            ->with('user_privacy:id,public_profile_visibility')
            ->orderBy('id')
            ->get()
            ->map(function (User $user): array {
                $payload = $user->toArray();
                $payload['public_profile_visibility'] = (bool) optional($user->user_privacy)->public_profile_visibility;
                $payload['two_factor_enabled'] = $user->hasEnabledTwoFactorAuthentication();
                $payload['user_age'] = ($user->user_age !== null && is_finite((float) $user->user_age))
                    ? (float) $user->user_age
                    : null;
                unset($payload['user_privacy']);

                return $payload;
            });

        return Inertia::render('administrator', [
            'users' => $users,
        ]);
    }

    // supprime un user (cascade)
    public function deleteUser(int $id): RedirectResponse
    {
        $user = User::find($id);

        if (!$user) {
            return back()->with('error', 'Utilisateur non trouvé.');
        }

        if ((int) Auth::id() === (int) $user->id) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        DB::transaction(function () use ($user): void {
            $user->user_privacy()->delete();

            DB::table('playlist_contient_track')->whereIn('playlist_id', $user->playlists()->select('playlist_id'))->delete();
            $user->playlists()->delete();
            $user->user_preference_echonest()->delete();
            $user->artists()->detach();
            $user->albums()->detach();
            $user->representes()->delete();
            $user->user_parles()->delete();
            $user->user_ecoutes()->delete();
            DB::table('ajoute_favori')->where('user_id', $user->id)->delete();
            $user->ajoute_genre_favoris()->delete();
            $user->delete();
        });

        return back()->with('success', 'Utilisateur supprimé avec succès.');
    }

    public function changeUserRole(int $id): RedirectResponse
    {
        $user = User::find($id);

        if (! $user) {
            return back()->with('error', 'Utilisateur non trouvé.');
        }

        if ((int) Auth::id() === (int) $user->id) {
            return back()->with('error', 'Vous ne pouvez pas modifier votre propre rôle.');
        }

        $currentRole = (int) ($user->id_role ?? 2);
        $user->id_role = $currentRole === 1 ? 2 : 1;
        $user->save();

        return back()->with('success', 'Rôle mis à jour avec succès.');
    }

    public function changeUserStatut(int $id): RedirectResponse
    {
        $user = User::find($id);

        if (! $user) {
            return back()->with('error', 'Utilisateur non trouvé.');
        }

        if ((int) Auth::id() === (int) $user->id) {
            return back()->with('error', 'Vous ne pouvez pas modifier votre propre statut.');
        }

        $currentVisibility = (bool) optional($user->user_privacy)->public_profile_visibility;

        DB::table('user_privacy')->updateOrInsert(
            ['id' => $user->id],
            ['public_profile_visibility' => ! $currentVisibility]
        );

        return back()->with('success', 'Statut du compte mis à jour avec succès.');
    }

    public function updateUser(int $id): RedirectResponse
    {
        $user = User::find($id);

        if (! $user) {
            return back()->with('error', 'Utilisateur non trouvé.');
        }

        $validated = request()->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('user', 'name')->ignore($id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('user', 'email')->ignore($id)],
            'user_job' => 'nullable|string|max:255',
            'user_gender' => 'nullable|string|max:50',
            'user_age' => 'nullable|numeric|min:0|max:150',
        ], [
            'name.required' => 'Le nom est requis.',
            'name.unique' => 'Ce nom est déjà utilisé.',
            'email.required' => 'L\'email est requis.',
            'email.email' => 'L\'email doit être valide.',
            'email.unique' => 'Cet email est déjà utilisé.',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->user_job = $validated['user_job'] ?? null;
        $user->user_gender = $validated['user_gender'] ?? null;
        $user->user_age = isset($validated['user_age']) ? (float) $validated['user_age'] : null;
        $user->save();

        return back()->with('success', 'Informations de l\'utilisateur mises à jour avec succès.');
    }
}
