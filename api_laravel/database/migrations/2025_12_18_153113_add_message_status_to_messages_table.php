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
            if (!Schema::hasColumn('messages', 'status')) {
                $table->enum('status', ['sent', 'delivered', 'read'])->default('sent')->after('body');
            }
            // Timestamps de entrega y lectura
            if (!Schema::hasColumn('messages', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('messages', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('delivered_at');
            }
        });

        // Agregar campo de mensajes no leídos a la tabla pivot (si last_read_at existe)
        if (Schema::hasColumn('conversation_user', 'last_read_at') && 
            !Schema::hasColumn('conversation_user', 'unread_count')) {
            Schema::table('conversation_user', function (Blueprint $table) {
                $table->integer('unread_count')->default(0)->after('last_read_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'status')) {
                $table->dropColumn(['status', 'delivered_at', 'read_at']);
            }
        });

        Schema::table('conversation_user', function (Blueprint $table) {
            if (Schema::hasColumn('conversation_user', 'unread_count')) {
                $table->dropColumn('unread_count');
            }
        });
    }
};

