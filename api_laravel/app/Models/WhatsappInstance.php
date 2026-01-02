<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappInstance extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'instance_name',
        'display_name',
        'phone_number',
        'status',
        'api_key',
        'metadata',
        'last_connected_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_connected_at' => 'datetime',
    ];

    /**
     * Tenant dueño de esta instancia
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Verificar si está conectada
     */
    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }

    /**
     * Verificar si está desconectada
     */
    public function isDisconnected(): bool
    {
        return $this->status === 'disconnected';
    }

    /**
     * Scope: solo instancias conectadas
     */
    public function scopeConnected($query)
    {
        return $query->where('status', 'connected');
    }

    /**
     * Scope: solo de un tenant específico
     */
    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Generar nombre único de instancia
     */
    public static function generateInstanceName(int $tenantId): string
    {
        $count = self::where('tenant_id', $tenantId)->count();
        return "tenant_{$tenantId}_instance_" . ($count + 1);
    }
}
