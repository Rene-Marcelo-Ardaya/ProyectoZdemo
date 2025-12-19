<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agrega las columnas faltantes a la tabla pivot conversation_user
     */
    public function up(): void
    {
        Schema::table('conversation_user', function (Blueprint $table) {
            // Agregar last_read_at si no existe
            if (!Schema::hasColumn('conversation_user', 'last_read_at')) {
                $table->timestamp('last_read_at')->nullable()->after('user_id');
            }
            
            // Agregar timestamps si no existen
            if (!Schema::hasColumn('conversation_user', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversation_user', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('conversation_user', 'last_read_at')) {
                $columns[] = 'last_read_at';
            }
            if (Schema::hasColumn('conversation_user', 'created_at')) {
                $columns[] = 'created_at';
                $columns[] = 'updated_at';
            }
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
