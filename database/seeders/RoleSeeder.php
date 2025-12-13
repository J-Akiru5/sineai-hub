<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = [
            'admin' => 'Admin',
            'director' => 'Director',
            'scriptwriter' => 'Scriptwriter',
            'cinematographer' => 'Cinematographer',
            'editor' => 'Editor',
            'producer' => 'Producer',
        ];

        $now = Carbon::now();

        foreach ($roles as $name => $display) {
            $data = ['name' => $name];
            if (Schema::hasColumn('roles', 'display_name')) {
                $data['display_name'] = $display;
            }
            if (Schema::hasColumn('roles', 'created_at')) {
                $data['created_at'] = $now;
            }
            if (Schema::hasColumn('roles', 'updated_at')) {
                $data['updated_at'] = $now;
            }

            DB::table('roles')->updateOrInsert([
                'name' => $name,
            ], $data);
        }

        // Create default admin user
        $adminEmail = 'admin@sineai.com';
        $existing = DB::table('users')->where('email', $adminEmail)->first();

        if (!$existing) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Admin',
                'email' => $adminEmail,
                'password' => Hash::make('password'),
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            $userId = $existing->id;
            DB::table('users')->where('id', $userId)->update(['name' => 'Admin', 'updated_at' => $now]);
        }

        // Attach admin role
        $adminRoleId = DB::table('roles')->where('name', 'admin')->value('id');
        if ($adminRoleId) {
            $pivotData = [];
            if (Schema::hasColumn('user_has_roles', 'created_at')) {
                $pivotData['created_at'] = $now;
            }
            if (Schema::hasColumn('user_has_roles', 'updated_at')) {
                $pivotData['updated_at'] = $now;
            }

            DB::table('user_has_roles')->updateOrInsert([
                'user_id' => $userId,
                'role_id' => $adminRoleId,
            ], $pivotData);
        }
    }
}
