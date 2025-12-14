<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Notification preferences
            $table->boolean('notify_likes')->default(true);
            $table->boolean('notify_comments')->default(true);
            $table->boolean('notify_follows')->default(true);
            $table->boolean('notify_mentions')->default(true);
            $table->boolean('notify_messages')->default(true);
            $table->boolean('notify_system')->default(true);
            $table->boolean('email_notifications')->default(false);
            
            // Privacy settings
            $table->enum('profile_visibility', ['public', 'followers', 'private'])->default('public');
            $table->boolean('show_email')->default(false);
            $table->boolean('show_social_links')->default(true);
            $table->boolean('allow_messages')->default(true);
            $table->boolean('show_activity')->default(true);
            
            // Appearance
            $table->string('theme')->default('dark'); // dark, light, system
            $table->string('accent_color')->default('amber'); // amber, blue, emerald, etc.
            $table->boolean('reduce_motion')->default(false);
            
            // Player preferences
            $table->boolean('autoplay')->default(true);
            $table->string('default_quality')->default('auto'); // auto, 1080p, 720p, 480p
            $table->boolean('theater_mode')->default(false);
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
