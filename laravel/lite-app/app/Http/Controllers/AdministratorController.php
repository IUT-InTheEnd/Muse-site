<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdministratorController extends Controller
{
    public function show(): Response
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'id_role', 'created_at', 'updated_at','user_job','user_plays_music','user_gender','user_instruments','user_music_contexts','profile_id'])
            ->orderBy('id')
            ->get();

        return Inertia::render('administrator', [
            'users' => $users,
        ]);
    }
}
