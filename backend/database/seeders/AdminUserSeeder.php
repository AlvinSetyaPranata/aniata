<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Create the admin account used by the private admin frontend.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@aniata.com');
        $password = env('ADMIN_PASSWORD', 'aniata-admin');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Aniata Admin',
                'password' => $password,
            ],
        );
    }
}
