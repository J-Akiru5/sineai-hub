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
        Schema::create('user_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Original filename
            $table->string('path'); // Storage path in DO Spaces
            $table->string('disk')->default('digitalocean');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size_bytes')->default(0);
            $table->enum('type', ['document', 'image', 'video', 'audio', 'other'])->default('other');
            $table->string('folder')->nullable(); // Virtual folder organization
            $table->json('metadata')->nullable(); // Extra info like dimensions, duration
            $table->timestamps();
            
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'folder']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_files');
    }
};
