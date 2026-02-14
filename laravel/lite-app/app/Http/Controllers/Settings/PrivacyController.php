<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PrivacyUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrivacyController extends Controller
{
    /**
     * Show the user's privacy settings page.
     */
    public function edit(Request $request)
    {
        return Inertia::render('settings/privacy', [
            'public_profile_visibility' => $request->user()->public_profile_visibility,
        ]);
    }

    public function update(PrivacyUpdateRequest $request): RedirectResponse
    {
        $request->user()->update([
            'public_profile_visibility' => $request->public_profile_visibility,
        ]);

        return back();
    }
}
