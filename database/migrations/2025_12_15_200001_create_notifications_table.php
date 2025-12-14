<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // like, comment, follow, mention, system, project_approved, etc.
            $table->string('title');
            $table->text('message')->nullable();
            $table->string('icon')->nullable(); // lucide icon name
            $table->string('link')->nullable(); // where to navigate when clicked
            $table->morphs('notifiable'); // polymorphic relation to project, comment, user, etc.
            $table->foreignId('actor_id')->nullable()->constrained('users')->onDelete('set null'); // who triggered the notification
            $table->json('data')->nullable(); // extra data
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
