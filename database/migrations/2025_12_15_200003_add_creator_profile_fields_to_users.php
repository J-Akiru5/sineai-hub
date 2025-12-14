<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Creator profile fields (only add if they don't exist)
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('name');
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('avatar_url');
            }
            if (!Schema::hasColumn('users', 'headline')) {
                $table->string('headline')->nullable()->after('bio'); // "Filmmaker | Editor | Storyteller"
            }
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location')->nullable()->after('headline');
            }
            if (!Schema::hasColumn('users', 'website')) {
                $table->string('website')->nullable()->after('location');
            }
            if (!Schema::hasColumn('users', 'social_links')) {
                $table->json('social_links')->nullable()->after('website'); // {twitter, instagram, youtube, etc}
            }
            if (!Schema::hasColumn('users', 'banner_url')) {
                $table->string('banner_url')->nullable()->after('avatar_url');
            }
            if (!Schema::hasColumn('users', 'is_verified_creator')) {
                $table->boolean('is_verified_creator')->default(false)->after('is_banned');
            }
            if (!Schema::hasColumn('users', 'creator_verified_at')) {
                $table->timestamp('creator_verified_at')->nullable()->after('is_verified_creator');
            }
            if (!Schema::hasColumn('users', 'followers_count')) {
                $table->unsignedInteger('followers_count')->default(0)->after('creator_verified_at');
            }
            if (!Schema::hasColumn('users', 'following_count')) {
                $table->unsignedInteger('following_count')->default(0)->after('followers_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['username', 'bio', 'headline', 'location', 'website', 'social_links', 
                       'banner_url', 'is_verified_creator', 'creator_verified_at', 
                       'followers_count', 'following_count'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
