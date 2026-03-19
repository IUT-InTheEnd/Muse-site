<?php

namespace Tests\Feature;

use App\Models\User;

use Tests\TestCase;

class UserInfoUpdateTest extends TestCase
{


    public function test_inertia_user_info_update_returns_a_redirect_instead_of_json(): void
    {
        $user = User::factory()->create([
            'user_age' => 18,
        ]);

        $response = $this
            ->actingAs($user)
            ->withHeaders([
                'X-Inertia' => 'true',
            ])
            ->from('/')
            ->patch(route('user.updateInfo'), [
                'user_age' => 20,
            ]);

        $response->assertRedirect('/');
        $this->assertSame(20, $user->fresh()->user_age);
    }
}
