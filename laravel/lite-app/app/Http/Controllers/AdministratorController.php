<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdministratorController extends Controller
{
    public function show(): Response
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'id_role', 'created_at', 'updated_at','user_job','user_plays_music','user_gender','user_instruments','user_music_contexts','profile_id','user_image_file'])
            ->orderBy('id')
            ->get();

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
}
