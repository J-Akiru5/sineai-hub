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
        // Users table additions
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
            $table->string('pen_name')->nullable()->after('avatar_url');
            $table->string('studio_name')->nullable()->after('pen_name');
            $table->string('location')->nullable()->after('studio_name');
            $table->string('contact_number')->nullable()->after('location');
            $table->boolean('is_approved')->default(true)->after('contact_number');
        });

        // Channels table additions
        Schema::table('channels', function (Blueprint $table) {
            $table->foreignId('allowed_role_id')->nullable()->constrained('roles')->nullOnDelete()->after('project_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('channels', function (Blueprint $table) {
            if (Schema::hasColumn('channels', 'allowed_role_id')) {
                $table->dropConstrainedForeignId('allowed_role_id');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_approved')) {
                $table->dropColumn('is_approved');
            }
            if (Schema::hasColumn('users', 'contact_number')) {
                $table->dropColumn('contact_number');
            }
            if (Schema::hasColumn('users', 'location')) {
                $table->dropColumn('location');
            }
            if (Schema::hasColumn('users', 'studio_name')) {
                $table->dropColumn('studio_name');
            }
            if (Schema::hasColumn('users', 'pen_name')) {
                $table->dropColumn('pen_name');
            }
            if (Schema::hasColumn('users', 'avatar_url')) {
                $table->dropColumn('avatar_url');
            }
        });
    }
};
