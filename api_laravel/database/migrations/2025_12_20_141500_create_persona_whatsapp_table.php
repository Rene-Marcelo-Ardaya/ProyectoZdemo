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
        Schema::create('persona_whatsapp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personal_id')->unique()->constrained('personal')->onDelete('cascade');
            $table->string('whatsapp_jid', 100)->nullable();
            $table->enum('status', ['pending', 'sent', 'verified', 'failed'])->default('pending');
            $table->string('verification_code', 4)->nullable();
            $table->timestamp('verification_sent_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('instance_name', 100)->nullable();
            $table->timestamps();
            
            $table->index('whatsapp_jid');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('persona_whatsapp');
    }
};
