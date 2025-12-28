<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AlertConfiguration extends Model
{
    protected $fillable = [
        'name',
        'type',
        'is_enabled',
        'config',
        'min_interval_minutes',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'config' => 'array',
        'min_interval_minutes' => 'integer',
    ];

    // Tipos de alerta disponibles
    const TYPE_WHATSAPP = 'whatsapp';
    const TYPE_EMAIL = 'email';
    const TYPE_SMS = 'sms';
    const TYPE_WEBHOOK = 'webhook';

    /**
     * Tanques asociados a esta configuración de alerta
     */
    public function tanques(): BelongsToMany
    {
        return $this->belongsToMany(Tanque::class, 'tanque_alert_config')
            ->withPivot('last_alert_at');
    }

    /**
     * Scope: alertas activas
     */
    public function scopeActivas($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope: alertas de WhatsApp
     */
    public function scopeWhatsapp($query)
    {
        return $query->where('type', self::TYPE_WHATSAPP);
    }

    /**
     * Verificar si se puede enviar alerta para un tanque específico
     * (respetando el intervalo mínimo)
     */
    public function canSendAlertForTanque(Tanque $tanque): bool
    {
        $pivot = $this->tanques()->where('tanque_id', $tanque->id)->first()?->pivot;
        
        if (!$pivot || !$pivot->last_alert_at) {
            return true;
        }

        $lastAlert = \Carbon\Carbon::parse($pivot->last_alert_at);
        $minInterval = $this->min_interval_minutes;

        return $lastAlert->addMinutes($minInterval)->isPast();
    }

    /**
     * Marcar que se envió una alerta para un tanque
     */
    public function markAlertSent(Tanque $tanque): void
    {
        $this->tanques()->updateExistingPivot($tanque->id, [
            'last_alert_at' => now(),
        ]);
    }

    /**
     * Obtener la instancia de Evolution API configurada
     */
    public function getEvolutionInstance(): ?string
    {
        return $this->config['instance'] ?? null;
    }

    /**
     * Obtener el destino (número o grupo)
     */
    public function getDestination(): ?string
    {
        return $this->config['destination'] ?? null;
    }
}
