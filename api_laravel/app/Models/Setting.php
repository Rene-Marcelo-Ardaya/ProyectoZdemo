<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Obtener un valor de configuración por su clave
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Establecer un valor de configuración
     */
    public static function setValue(string $key, $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        
        // Limpiar cache
        Cache::forget('settings_public');
        Cache::forget('settings_all');
    }

    /**
     * Obtener todas las configuraciones públicas (para frontend sin auth)
     */
    public static function getPublicSettings(): array
    {
        return Cache::remember('settings_public', 3600, function () {
            return static::where('is_public', true)
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Obtener todas las configuraciones agrupadas
     */
    public static function getAllGrouped(): array
    {
        return Cache::remember('settings_all', 3600, function () {
            return static::all()
                ->groupBy('group')
                ->map(function ($items) {
                    return $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'key' => $item->key,
                            'value' => $item->value,
                            'type' => $item->type,
                            'label' => $item->label,
                            'description' => $item->description,
                            'is_public' => $item->is_public,
                        ];
                    });
                })
                ->toArray();
        });
    }

    /**
     * Limpiar toda la cache de settings
     */
    public static function clearCache(): void
    {
        Cache::forget('settings_public');
        Cache::forget('settings_all');
    }
}
