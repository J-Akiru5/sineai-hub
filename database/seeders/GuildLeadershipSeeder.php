<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class GuildLeadershipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates officer accounts for the SineAI leadership team.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();

        // Define the leadership team
        $officers = [
            [
                'name' => 'Jeff Martinez',
                'email' => 'jeff@sineai.com',
                'position' => 'President',
                'tags' => ['Leadership', 'Executive Board'],
            ],
            [
                'name' => 'Diether Jaye Catolin',
                'email' => 'diether@sineai.com',
                'position' => 'Vice President',
                'tags' => ['Leadership', 'Executive Board'],
            ],
            [
                'name' => 'Xavier Jess Villanis',
                'email' => 'xavier@sineai.com',
                'position' => 'Secretary',
                'tags' => ['Leadership', 'Executive Board', 'Documentation'],
            ],
            [
                'name' => 'Christian Chavez',
                'email' => 'christian@sineai.com',
                'position' => 'Director of Technology and Innovations',
                'tags' => ['Leadership', 'Tech Team', 'Innovations'],
            ],
            [
                'name' => 'Romer Jhon Falalimpa',
                'email' => 'romer@sineai.com',
                'position' => 'Director of Cultural Heritage',
                'tags' => ['Leadership', 'Cultural Heritage', 'Productions'],
            ],
            [
                'name' => 'Ariane Pearl Gegawin',
                'email' => 'ariane@sineai.com',
                'position' => 'Director of External Affairs',
                'tags' => ['Leadership', 'External Affairs', 'Partnerships'],
            ],
        ];

        // Get the officer role ID
        $officerRole = DB::table('roles')->where('name', 'officer')->first();
        
        // If officer role doesn't exist, create it
        if (!$officerRole) {
            $officerRoleId = DB::table('roles')->insertGetId([
                'name' => 'officer',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            $officerRoleId = $officerRole->id;
        }

        foreach ($officers as $officer) {
            // Check if user already exists
            $existingUser = DB::table('users')->where('email', $officer['email'])->first();

            if (!$existingUser) {
                // Create the user
                $userId = DB::table('users')->insertGetId([
                    'name' => $officer['name'],
                    'email' => $officer['email'],
                    'password' => Hash::make('SineAI2025!'),
                    'email_verified_at' => $now,
                    'position' => $officer['position'],
                    'tags' => json_encode($officer['tags']),
                    'is_approved' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                // Assign officer role
                DB::table('user_has_roles')->updateOrInsert(
                    ['user_id' => $userId, 'role_id' => $officerRoleId],
                    ['created_at' => $now, 'updated_at' => $now]
                );

                $this->command->info("Created officer: {$officer['name']} ({$officer['position']})");
            } else {
                // Update existing user with position and tags
                DB::table('users')->where('id', $existingUser->id)->update([
                    'position' => $officer['position'],
                    'tags' => json_encode($officer['tags']),
                    'updated_at' => $now,
                ]);

                // Ensure they have officer role
                DB::table('user_has_roles')->updateOrInsert(
                    ['user_id' => $existingUser->id, 'role_id' => $officerRoleId],
                    ['created_at' => $now, 'updated_at' => $now]
                );

                $this->command->info("Updated officer: {$officer['name']} ({$officer['position']})");
            }
        }

        $this->command->info('Guild Leadership seeding completed!');
    }
}
