<?php

namespace App\Observers;

use App\Models\Playlist;
use App\Models\User;

class UserObserver
{
    /**
     * Gère l'événement "created" pour le modèle User.
     */
    public function created(User $user): void
    {
        // Crée automatiquement une playlist "Favoris" pour le nouvel utilisateur
        Playlist::create([
            'user_id' => $user->id,
            'playlist_name' => 'Favoris',
            'playlist_description' => 'Vos titres favoris',
            'playlist_date_created' => now(),
            'playlist_date_updated' => now(),
            'playlist_public' => false,
            'playlist_deletable' => false,
        ]);
    }
}
