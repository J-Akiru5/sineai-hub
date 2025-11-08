<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Create the schema for the projects table.
        // It needs an id, a user_id foreign key to users, title, description (nullable),
        // video_url, thumbnail_url (nullable), status (default 'published'), and timestamps.
        // Also add an index on user_id for fast lookups when retrieving a user's projects.
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            // Foreign key to users table. Cascade on delete so user's projects are removed when a user is deleted.
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Core project metadata
            $table->string('title');
            $table->text('description')->nullable();

            // Locations in Supabase storage (or external URLs)
            $table->string('video_url');
            $table->string('thumbnail_url')->nullable();

            // Publication/status field (e.g., 'published', 'draft')
            $table->string('status')->default('published');

            $table->timestamps();

            // Index for queries by owner
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('projects');
    }
};
