<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agrega campos de estado para mensajes (tipo WhatsApp)
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Estado del mensaje: sent, delivered, read
            $table->enum('status', ['sent', 'delivered', 'read'])->default('sent')->after('body');
            // Timestamps de entrega y lectura
            $table->timestamp('delivered_at')->nullable()->after('status');
            $table->timestamp('read_at')->nullable()->after('delivered_at');
        });

        // Agregar campo de mensajes no leídos a la tabla pivot
        Schema::table('conversation_user', function (Blueprint $table) {
            $table->integer('unread_count')->default(0)->after('last_read_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['status', 'delivered_at', 'read_at']);
        });

        Schema::table('conversation_user', function (Blueprint $table) {
            $table->dropColumn('unread_count');
        });
    }
};
