<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Director's note - editable by the project owner
            $table->text('directors_note')->nullable()->after('description');
            
            // Duration in seconds (auto-extracted or manually set)
            $table->integer('duration')->nullable()->after('directors_note');
            
            // Release year
            $table->year('release_year')->nullable()->after('duration');
            
            // Content rating (G, PG, PG-13, R, etc.)
            $table->string('content_rating', 10)->nullable()->after('release_year');
            
            // Language
            $table->string('language', 50)->default('English')->after('content_rating');
            
            // Chapters/timestamps stored as JSON
            // Format: [{"time": 0, "title": "Intro"}, {"time": 120, "title": "Scene 1"}]
            $table->json('chapters')->nullable()->after('language');
            
            // Cast & crew as JSON
            // Format: [{"role": "Director", "name": "John Doe"}, {"role": "Lead Actor", "name": "Jane Doe"}]
            $table->json('cast_crew')->nullable()->after('chapters');
            
            // Tags for better discoverability
            $table->json('tags')->nullable()->after('cast_crew');
            
            // Featured flag for homepage
            $table->boolean('is_featured')->default(false)->after('tags');
            
            // Likes count for engagement
            $table->unsignedBigInteger('likes_count')->default(0)->after('views_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'directors_note',
                'duration',
                'release_year',
                'content_rating',
                'language',
                'chapters',
                'cast_crew',
                'tags',
                'is_featured',
                'likes_count',
            ]);
        });
    }
};
