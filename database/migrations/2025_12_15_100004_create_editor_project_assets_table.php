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
        Schema::create('editor_project_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('editor_project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_file_id')->nullable()->constrained('user_files')->onDelete('set null');
            $table->string('name');
            $table->string('path'); // Storage path
            $table->string('type'); // video, audio, image
            $table->bigInteger('size_bytes')->default(0);
            $table->integer('duration_ms')->nullable(); // For video/audio
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('editor_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('editor_project_assets');
    }
};
