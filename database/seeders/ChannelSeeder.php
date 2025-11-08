<?php

namespace Database\Seeders;

use App\Models\Channel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use firstOrCreate to avoid duplicate entries
        Channel::firstOrCreate(
            ['name' => 'General'],
            ['description' => 'The main channel for general discussion about SineAI Hub and related topics.']
        );
    }
}
