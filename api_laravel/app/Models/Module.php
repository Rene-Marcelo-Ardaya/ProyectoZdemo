<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'price_monthly',
        'is_addon',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'is_addon' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Planes que incluyen este módulo
     */
    public function plans(): BelongsToMany
    {
        return $this->belongsToMany(Plan::class, 'plan_module');
    }

    /**
     * Tenants que compraron este módulo como add-on
     */
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_module')
            ->withPivot(['purchased_at', 'expires_at', 'price_paid'])
            ->withTimestamps();
    }

    /**
     * Scope: solo módulos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: solo add-ons (comprables por separado)
     */
    public function scopeAddons($query)
    {
        return $query->where('is_addon', true);
    }

    /**
     * Scope: ordenados
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
