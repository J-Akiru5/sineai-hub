<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get role IDs
        $officerRole = Role::where('name', 'officer')->first();
        $adminRole = Role::where('name', 'admin')->first();

        // ===== GENERAL CHANNELS (Public) =====
        $generalChannels = [
            [
                'name' => 'general',
                'description' => 'General discussion for all members',
                'category' => 'General',
            ],
            [
                'name' => 'introductions',
                'description' => 'Introduce yourself to the community!',
                'category' => 'General',
            ],
            [
                'name' => 'announcements',
                'description' => 'Important announcements from the team',
                'category' => 'General',
            ],
            [
                'name' => 'feedback',
                'description' => 'Share your feedback and suggestions',
                'category' => 'General',
            ],
        ];

        // ===== PRODUCTION CHANNELS (Public) =====
        $productionChannels = [
            [
                'name' => 'show-and-tell',
                'description' => 'Share your work in progress and finished projects',
                'category' => 'Production',
            ],
            [
                'name' => 'scriptwriting',
                'description' => 'Discuss scripts, dialogue, and storytelling',
                'category' => 'Production',
            ],
            [
                'name' => 'cinematography',
                'description' => 'Camera work, lighting, and visual composition',
                'category' => 'Production',
            ],
            [
                'name' => 'ai-tools',
                'description' => 'Tips and tricks for AI-assisted filmmaking',
                'category' => 'Production',
            ],
            [
                'name' => 'casting-call',
                'description' => 'Find collaborators for your projects',
                'category' => 'Production',
            ],
        ];

        // ===== OFFICER DECK (Officers Only) =====
        $officerChannels = [
            [
                'name' => 'officer-lounge',
                'description' => 'Private discussion for officers',
                'category' => 'Officer Deck',
                'allowed_role_id' => $officerRole?->id,
            ],
            [
                'name' => 'leadership-planning',
                'description' => 'Strategic planning and initiatives',
                'category' => 'Officer Deck',
                'allowed_role_id' => $officerRole?->id,
            ],
            [
                'name' => 'tech-innovations',
                'description' => 'Tech team discussions and updates',
                'category' => 'Officer Deck',
                'allowed_role_id' => $officerRole?->id,
            ],
            [
                'name' => 'events-coordination',
                'description' => 'Planning and coordinating events',
                'category' => 'Officer Deck',
                'allowed_role_id' => $officerRole?->id,
            ],
        ];

        // ===== ADMIN CHANNELS (Admins Only) =====
        $adminChannels = [
            [
                'name' => 'admin-hub',
                'description' => 'Administrative discussions',
                'category' => 'Admin',
                'allowed_role_id' => $adminRole?->id,
            ],
            [
                'name' => 'moderation-log',
                'description' => 'Moderation actions and reports',
                'category' => 'Admin',
                'allowed_role_id' => $adminRole?->id,
            ],
        ];

        // Seed all channels
        $allChannels = array_merge(
            $generalChannels,
            $productionChannels,
            $officerChannels,
            $adminChannels
        );

        foreach ($allChannels as $channelData) {
            Channel::updateOrCreate(
                ['name' => $channelData['name']],
                $channelData
            );
        }

        $this->command->info('Channels seeded: ' . count($allChannels) . ' total');
    }
}
