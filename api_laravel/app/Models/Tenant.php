<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'custom_domain',
        'plan_id',
        'email',
        'phone',
        'logo',
        'settings',
        'is_active',
        'trial_ends_at',
        'subscription_ends_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
    ];

    /**
     * Plan del tenant
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Módulos adicionales comprados
     */
    public function additionalModules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'tenant_module')
            ->withPivot(['purchased_at', 'expires_at', 'price_paid'])
            ->withTimestamps();
    }

    /**
     * Usuarios del tenant
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Instancias de WhatsApp del tenant
     */
    public function whatsappInstances(): HasMany
    {
        return $this->hasMany(WhatsappInstance::class);
    }

    /**
     * Verificar si el tenant tiene acceso a un módulo
     * (ya sea por plan o por add-on comprado)
     */
    public function hasModule(string $moduleSlug): bool
    {
        // Verificar en el plan
        if ($this->plan && $this->plan->hasModule($moduleSlug)) {
            return true;
        }

        // Verificar en módulos adicionales comprados
        return $this->additionalModules()
            ->where('slug', $moduleSlug)
            ->where(function ($query) {
                $query->whereNull('tenant_module.expires_at')
                      ->orWhere('tenant_module.expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Verificar si el tenant está en período de prueba
     */
    public function isOnTrial(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isFuture();
    }

    /**
     * Verificar si el trial expiró
     */
    public function trialExpired(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isPast();
    }

    /**
     * Verificar si la suscripción está activa
     */
    public function hasActiveSubscription(): bool
    {
        // En trial = activo
        if ($this->isOnTrial()) {
            return true;
        }

        // Tiene suscripción vigente
        if ($this->subscription_ends_at !== null && $this->subscription_ends_at->isFuture()) {
            return true;
        }

        return false;
    }

    /**
     * Verificar si puede agregar más instancias de WhatsApp
     */
    public function canAddWhatsappInstance(): bool
    {
        if (!$this->plan) {
            return false;
        }

        $currentCount = $this->whatsappInstances()->count();
        $maxAllowed = $this->plan->max_whatsapp_instances;

        // Contar instancias extra compradas
        $extraInstances = $this->additionalModules()
            ->where('slug', 'whatsapp-extra')
            ->where(function ($query) {
                $query->whereNull('tenant_module.expires_at')
                      ->orWhere('tenant_module.expires_at', '>', now());
            })
            ->count();

        return $currentCount < ($maxAllowed + $extraInstances);
    }

    /**
     * Obtener cantidad de usuarios restantes permitidos
     */
    public function remainingUsers(): int
    {
        if (!$this->plan) {
            return 0;
        }

        $currentCount = $this->users()->count();
        return max(0, $this->plan->max_users - $currentCount);
    }

    /**
     * Scope: solo tenants activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Obtener configuración específica
     */
    public function getSetting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }
}
