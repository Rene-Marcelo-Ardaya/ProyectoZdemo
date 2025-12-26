<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;

class ApiCredential extends Model
{
    protected $fillable = [
        'provider',
        'key_name',
        'value_encrypted',
        'is_secret',
        'is_active',
        'label',
        'description',
    ];

    protected $casts = [
        'is_secret' => 'boolean',
        'is_active' => 'boolean',
    ];

    // No exponer el valor encriptado en JSON
    protected $hidden = ['value_encrypted'];

    /**
     * Obtener el valor desencriptado
     */
    public function getValueAttribute(): ?string
    {
        if (empty($this->value_encrypted)) {
            return null;
        }
        
        try {
            return Crypt::decryptString($this->value_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Establecer el valor encriptado
     */
    public function setValueAttribute($value): void
    {
        $this->attributes['value_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Obtener todas las credenciales de un proveedor
     */
    public static function getCredentials(string $provider): array
    {
        $cacheKey = "api_credentials_{$provider}";
        
        return Cache::remember($cacheKey, 3600, function () use ($provider) {
            $credentials = static::where('provider', $provider)
                ->where('is_active', true)
                ->get();
            
            $result = [];
            foreach ($credentials as $cred) {
                $result[$cred->key_name] = $cred->value;
            }
            
            return $result;
        });
    }

    /**
     * Obtener un valor específico de un proveedor
     */
    public static function getValue(string $provider, string $keyName, $default = null): ?string
    {
        $credentials = static::getCredentials($provider);
        return $credentials[$keyName] ?? $default;
    }

    /**
     * Guardar o actualizar una credencial
     */
    public static function setCredential(string $provider, string $keyName, ?string $value, array $extra = []): self
    {
        $credential = static::updateOrCreate(
            ['provider' => $provider, 'key_name' => $keyName],
            array_merge(['value' => $value], $extra)
        );
        
        // Limpiar cache
        static::clearCache($provider);
        
        return $credential;
    }

    /**
     * Limpiar cache de un proveedor
     */
    public static function clearCache(?string $provider = null): void
    {
        if ($provider) {
            Cache::forget("api_credentials_{$provider}");
        } else {
            // Limpiar cache de todos los proveedores conocidos
            foreach (['pusher', 'twilio', 'stripe'] as $prov) {
                Cache::forget("api_credentials_{$prov}");
            }
        }
    }

    /**
     * Obtener el valor enmascarado para mostrar en UI
     */
    public function getMaskedValueAttribute(): string
    {
        $value = $this->value;
        if (empty($value)) {
            return '';
        }
        
        if ($this->is_secret) {
            // Mostrar solo últimos 4 caracteres
            $len = strlen($value);
            if ($len <= 4) {
                return str_repeat('*', $len);
            }
            return str_repeat('*', $len - 4) . substr($value, -4);
        }
        
        return $value;
    }
}
