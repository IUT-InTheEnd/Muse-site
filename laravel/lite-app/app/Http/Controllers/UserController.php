<?php

namespace App\Http\Controllers;

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
