<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (! Schema::hasColumn('activity_logs', 'category')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->string('category')->nullable()->index()->after('description');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('activity_logs', 'category')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->dropIndex(['category']);
                $table->dropColumn('category');
            });
        }
    }
};
