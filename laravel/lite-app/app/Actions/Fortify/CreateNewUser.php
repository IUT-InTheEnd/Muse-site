<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ], [
            'name.required' => 'Merci de renseigner un pseudonyme.',
            'name.unique' => 'Ce pseudonyme est déjà utilisé. Essayez-en un autre.',
            'email.required' => 'Merci de renseigner une adresse e-mail.',
            'email.email' => 'Le format de l’adresse e-mail est invalide.',
            'email.unique' => 'Cette adresse e-mail est déjà associée à un compte. Si vous avez déjà un compte, essayez de vous connecter ou de réinitialiser votre mot de passe.',
            'password.required' => 'Merci de renseigner un mot de passe.',
            'password.min' => 'Votre mot de passe doit contenir au moins :min caractères.',
            'password.letters' => 'Votre mot de passe doit contenir au moins une lettre.',
            'password.mixed' => 'Votre mot de passe doit contenir une majuscule',
            'password.numbers' => 'Votre mot de passe doit contenir au moins un chiffre.',
            'password.symbols' => 'Votre mot de passe doit contenir au moins un symbole.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ])->validate();

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
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => bcrypt($input['password']),
            'profile_id' => $userProfile->id,
        ]);

        $userPrivacy = $user->user_privacy()->create();

        return $user;
    }
}
