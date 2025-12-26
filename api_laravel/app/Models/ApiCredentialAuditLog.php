<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiCredentialAuditLog extends Model
{
    // Desactivar timestamps automáticos (solo usamos created_at)
    public $timestamps = false;

    protected $table = 'api_credentials_audit_log';

    protected $fillable = [
        'user_id',
        'user_name',
        'provider',
        'key_name',
        'action',
        'old_value_hash',
        'new_value_hash',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Relación con usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Registrar una acción de auditoría
     */
    public static function log(
        int $userId,
        string $userName,
        string $provider,
        string $keyName,
        string $action,
        ?string $oldValue = null,
        ?string $newValue = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'user_name' => $userName,
            'provider' => $provider,
            'key_name' => $keyName,
            'action' => $action,
            'old_value_hash' => $oldValue ? hash('sha256', $oldValue) : null,
            'new_value_hash' => $newValue ? hash('sha256', $newValue) : null,
            'ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
            'created_at' => now(),
        ]);
    }
}
