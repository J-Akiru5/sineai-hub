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
        Schema::table('user_settings', function (Blueprint $table) {
            // Add missing notification columns if they don't exist
            if (!Schema::hasColumn('user_settings', 'push_notifications')) {
                $table->boolean('push_notifications')->default(true)->after('email_notifications');
            }
            if (!Schema::hasColumn('user_settings', 'digest_frequency')) {
                $table->string('digest_frequency')->default('daily')->after('push_notifications');
            }
            if (!Schema::hasColumn('user_settings', 'notify_project_updates')) {
                $table->boolean('notify_project_updates')->default(true)->after('notify_messages');
            }
            
            // Add missing privacy columns
            if (!Schema::hasColumn('user_settings', 'show_online_status')) {
                $table->boolean('show_online_status')->default(true)->after('show_activity');
            }
            
            // Add missing appearance columns
            if (!Schema::hasColumn('user_settings', 'language')) {
                $table->string('language')->default('en')->after('theme');
            }
            if (!Schema::hasColumn('user_settings', 'reduced_motion')) {
                $table->boolean('reduced_motion')->default(false)->after('reduce_motion');
            }
            
            // Add missing player columns
            if (!Schema::hasColumn('user_settings', 'playback_speed')) {
                $table->string('playback_speed')->default('1')->after('theater_mode');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $columns = [
                'push_notifications',
                'digest_frequency',
                'notify_project_updates',
                'show_online_status',
                'language',
                'reduced_motion',
                'playback_speed',
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('user_settings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
