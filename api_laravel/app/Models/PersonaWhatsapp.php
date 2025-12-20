<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonaWhatsapp extends Model
{
    use HasFactory;

    protected $table = 'persona_whatsapp';

    protected $fillable = [
        'personal_id',
        'whatsapp_jid',
        'status',
        'verification_code',
        'verification_sent_at',
        'verified_at',
        'instance_name',
    ];

    protected $casts = [
        'verification_sent_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Status constants
     */
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_VERIFIED = 'verified';
    const STATUS_FAILED = 'failed';

    /**
     * Relación con Persona
     */
    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'personal_id');
    }

    /**
     * Verificar si está verificado
     */
    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED && $this->verified_at !== null;
    }

    /**
     * Generar código de verificación
     */
    public function generateCode(): string
    {
        $this->verification_code = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $this->verification_sent_at = now();
        $this->status = self::STATUS_SENT;
        return $this->verification_code;
    }

    /**
     * Verificar código
     */
    public function verifyCode(string $code, string $jid): bool
    {
        if ($this->verification_code === $code) {
            $this->whatsapp_jid = $jid;
            $this->verified_at = now();
            $this->status = self::STATUS_VERIFIED;
            $this->verification_code = null;
            return true;
        }
        return false;
    }
}
