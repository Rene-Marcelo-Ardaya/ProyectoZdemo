<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar campo session_timeout_minutes a roles
        Schema::table('roles', function (Blueprint $table) {
            $table->integer('session_timeout_minutes')->nullable()->after('is_active');
        });

        // Actualizar roles existentes
        // Super Admin = null (sin límite)
        DB::table('roles')->where('slug', 'super-admin')->update([
            'session_timeout_minutes' => null
        ]);

        // Usuario = 60 minutos (1 hora)
        DB::table('roles')->where('slug', 'user')->update([
            'session_timeout_minutes' => 60
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('session_timeout_minutes');
        });
    }
};
