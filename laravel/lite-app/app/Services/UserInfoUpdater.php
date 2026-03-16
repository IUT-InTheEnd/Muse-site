<?php

namespace App\Services;

use App\Models\User;

class UserInfoUpdater
{
    public function update(User $user, array $validatedData): User
    {
        foreach (['user_instruments', 'user_music_contexts'] as $field) {
            if (! array_key_exists($field, $validatedData)) {
                $validatedData[$field] = null;
            }
        }

        $stringify = fn (string $value): string => "'".$value."'";

        $user->user_age = $validatedData['user_age'] ?? $user->user_age;
        $user->user_job = $validatedData['user_job'] ?? $user->user_job;
        $user->user_gender = $validatedData['user_gender'] ?? $user->user_gender;

        if (! is_null($validatedData['user_instruments'])) {
            $user->user_instruments = '['.implode(', ', array_map($stringify, $validatedData['user_instruments'])).']';
        }

        if (! is_null($validatedData['user_music_contexts'])) {
            $user->user_music_contexts = '['.implode(', ', array_map($stringify, $validatedData['user_music_contexts'])).']';
        }

        $user->user_plays_music = $validatedData['user_plays_music'] ?? $user->user_plays_music;
        $user->save();

        return $user->fresh();
    }
}
