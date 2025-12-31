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
        Schema::create('d_tanque_personal', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('d_tanque_id');
            $table->unsignedBigInteger('personal_id');
            $table->timestamps();

            $table->foreign('d_tanque_id')->references('id')->on('d_tanques')->cascadeOnDelete();
            $table->foreign('personal_id')->references('id')->on('personal')->cascadeOnDelete();
            
            // Un personal no puede tener el mismo tanque dos veces
            $table->unique(['d_tanque_id', 'personal_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('d_tanque_personal');
    }
};
