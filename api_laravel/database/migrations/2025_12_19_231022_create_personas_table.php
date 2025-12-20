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
        Schema::create('personal', function (Blueprint $table) {
            $table->id();
            
            // ==========================================
            // DATOS PERSONALES
            // ==========================================
            $table->string('nombre', 100);
            $table->string('apellidos', 150);
            $table->string('ci', 20)->nullable()->unique()->comment('Carnet de Identidad');
            $table->date('fecha_nacimiento')->nullable();
            $table->enum('genero', ['M', 'F', 'O'])->nullable()->comment('M=Masculino, F=Femenino, O=Otro');
            
            // ==========================================
            // CONTACTO
            // ==========================================
            $table->string('codigo_pais', 5)->default('591')->comment('Código de país sin el +');
            $table->string('celular', 20)->nullable();
            $table->string('email_personal', 150)->nullable();
            $table->text('direccion')->nullable();
            $table->string('ciudad', 100)->nullable();
            
            // ==========================================
            // ESTADO Y METADATA
            // ==========================================
            $table->boolean('is_active')->default(true);
            $table->text('notas')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabla pivot: Una persona puede tener muchos usuarios
        Schema::create('personal_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personal_id')->constrained('personal')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Un usuario solo puede estar asociado a una persona una vez
            $table->unique(['personal_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_user');
        Schema::dropIfExists('personal');
    }
};
