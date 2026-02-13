<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class PrivacyUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'public_profile_visibility' => 'required|boolean',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
