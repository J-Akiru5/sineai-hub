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
        Schema::create('editor_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->json('timeline_data')->nullable(); // Clips, positions, effects, etc.
            $table->json('settings')->nullable(); // Resolution, framerate, etc.
            $table->enum('status', ['draft', 'rendering', 'completed', 'failed'])->default('draft');
            $table->string('export_path')->nullable(); // Final rendered video path
            $table->integer('duration_seconds')->default(0);
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('editor_projects');
    }
};
