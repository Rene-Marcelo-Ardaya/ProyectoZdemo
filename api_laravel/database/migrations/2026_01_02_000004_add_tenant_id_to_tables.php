<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tablas que necesitan tenant_id (solo tablas con columna 'id')
     * Excluidas tablas pivote como tanque_alert_config, role_user, etc.
     */
    private array $tables = [
        'users',
        'personal',
        'tanques',
        'cargos',
        'roles',
        'menus',
        'permissions',
        'conversations',
        'messages',
        'api_credentials',
        'api_credential_audit_logs',
        'settings',
        'niveles_seguridad',
        'componentes_seguridad',
        'alert_configurations',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            // Verificar que la tabla existe, tiene columna 'id', y no tiene tenant_id todavía
            if (Schema::hasTable($tableName) && 
                Schema::hasColumn($tableName, 'id') && 
                !Schema::hasColumn($tableName, 'tenant_id')) {
                
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreignId('tenant_id')
                        ->nullable()  // Nullable temporalmente para datos existentes
                        ->after('id')
                        ->constrained('tenants')
                        ->onDelete('cascade');
                    
                    $table->index('tenant_id');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'tenant_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $table->dropForeign([$tableName . '_tenant_id_foreign']);
                    $table->dropIndex([$tableName . '_tenant_id_index']);
                    $table->dropColumn('tenant_id');
                });
            }
        }
    }
};
