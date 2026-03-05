<?php

namespace App\Rules;

use App\Models\Artist;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ArtistInDB implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (Artist::whereRaw('LOWER(artist_name) = LOWER(?)', trim(strtolower($value)))->get()->isEmpty()) {
            $fail(':attribute is not an artist present in the database.');
        }
    }
}
