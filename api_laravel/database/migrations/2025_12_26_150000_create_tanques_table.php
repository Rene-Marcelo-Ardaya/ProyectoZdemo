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
        Schema::create('tanques', function (Blueprint $table) {
            $table->id();
            
            // Identificación
            $table->string('nombre', 100);
            $table->string('codigo', 20)->unique()->nullable();
            
            // Tipo de tanque
            $table->enum('tipo', ['ESTATICO', 'MOVIL'])->default('ESTATICO');
            
            // Capacidad y niveles
            $table->decimal('capacidad_litros', 12, 2);
            $table->decimal('nivel_actual', 12, 2)->default(0);
            $table->decimal('nivel_minimo_alerta', 12, 2)->default(0);
            
            // Para tanques ESTÁTICOS
            $table->string('ubicacion_fija', 200)->nullable();
            
            // Para tanques MÓVILES (cisternas)
            $table->string('placa_cisterna', 20)->nullable();
            $table->foreignId('responsable_id')->nullable()->constrained('personal')->nullOnDelete();
            
            // Estado
            $table->boolean('is_active')->default(true);
            $table->text('observaciones')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tanques');
    }
};
