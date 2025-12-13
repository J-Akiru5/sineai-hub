<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            'access_admin',
            'manage_users',
            'manage_roles',
            'delete_projects',
            'ban_users',
        ];

        foreach ($permissions as $name) {
            DB::table('permissions')->updateOrInsert([
                'name' => $name,
            ], [
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
