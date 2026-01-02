<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class SuperAdminAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Usuario que realizó la acción
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Registrar una acción de auditoría
     */
    public static function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): self {
        $request = $request ?? request();

        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    /**
     * Helper: registrar creación
     */
    public static function logCreate(Model $model): self
    {
        return self::log(
            action: 'create',
            entityType: class_basename($model),
            entityId: $model->id,
            newValues: $model->toArray()
        );
    }

    /**
     * Helper: registrar actualización
     */
    public static function logUpdate(Model $model, array $oldValues): self
    {
        return self::log(
            action: 'update',
            entityType: class_basename($model),
            entityId: $model->id,
            oldValues: $oldValues,
            newValues: $model->toArray()
        );
    }

    /**
     * Helper: registrar eliminación
     */
    public static function logDelete(Model $model): self
    {
        return self::log(
            action: 'delete',
            entityType: class_basename($model),
            entityId: $model->id,
            oldValues: $model->toArray()
        );
    }
}
