# Sistema de Niveles de Seguridad Dinámico

Sistema que permite controlar la visibilidad de botones/componentes basándose en el nivel de seguridad asignado al personal.

## Arquitectura de Base de Datos

```
┌─────────────────────────┐
│   niveles_seguridad     │
├─────────────────────────┤
│ id (PK)                 │
│ nombre (Bajo, Alto...)  │
│ nivel (1-10)            │
│ color (#hex)            │
│ descripcion             │
│ is_active               │
│ timestamps              │
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌─────────────┐  ┌──────────────────────┐
│  personal   │  │ componente_seguridad │
├─────────────┤  ├──────────────────────┤
│ ...         │  │ id (PK)              │
│ nivel_seg_id│  │ componente_id (UK)   │  ← ej: "btn_crear_usuario"
└─────────────┘  │ pagina               │  ← ej: "/sistemas/usuarios"
                 │ nivel_seguridad_id   │
                 │ timestamps           │
                 └──────────────────────┘
```

**Lógica:** Usuario puede ver botón si: `personal.nivel_seguridad.nivel >= boton.nivel_seguridad.nivel`

---

## Backend (Laravel)

### 1. Migración: `2025_12_23_165000_create_security_levels_tables.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla de Niveles de Seguridad
        Schema::create('niveles_seguridad', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50);           // "Bajo", "Medio", "Alto", "Crítico"
            $table->unsignedTinyInteger('nivel');   // 1-10
            $table->string('color', 7)->default('#6b7280'); // Hex color
            $table->text('descripcion')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('nivel'); // Cada nivel numérico es único
        });

        // 2. Tabla de Componentes con Seguridad
        Schema::create('componente_seguridad', function (Blueprint $table) {
            $table->id();
            $table->string('componente_id', 100);   // ID único del botón: "usuarios.crear"
            $table->string('pagina', 100);          // Ruta: "/sistemas/usuarios"
            $table->string('descripcion')->nullable();
            $table->foreignId('nivel_seguridad_id')->constrained('niveles_seguridad')->cascadeOnDelete();
            $table->timestamps();

            $table->unique('componente_id'); // Cada componente solo tiene un nivel
        });

        // 3. Modificar tabla personal para agregar nivel de seguridad
        if (Schema::hasTable('personal')) {
            Schema::table('personal', function (Blueprint $table) {
                $table->foreignId('nivel_seguridad_id')
                      ->nullable()
                      ->after('user_id')
                      ->constrained('niveles_seguridad')
                      ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('personal', 'nivel_seguridad_id')) {
            Schema::table('personal', function (Blueprint $table) {
                $table->dropForeign(['nivel_seguridad_id']);
                $table->dropColumn('nivel_seguridad_id');
            });
        }
        Schema::dropIfExists('componente_seguridad');
        Schema::dropIfExists('niveles_seguridad');
    }
};
```

### 2. Modelo: `NivelSeguridad.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NivelSeguridad extends Model
{
    use HasFactory;

    protected $table = 'niveles_seguridad';

    protected $fillable = [
        'nombre',
        'nivel',
        'color',
        'descripcion',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'nivel' => 'integer',
    ];

    public function personal(): HasMany
    {
        return $this->hasMany(Personal::class, 'nivel_seguridad_id');
    }

    public function componentes(): HasMany
    {
        return $this->hasMany(ComponenteSeguridad::class, 'nivel_seguridad_id');
    }
}
```

### 3. Modelo: `ComponenteSeguridad.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComponenteSeguridad extends Model
{
    use HasFactory;

    protected $table = 'componente_seguridad';

    protected $fillable = [
        'componente_id',
        'pagina',
        'descripcion',
        'nivel_seguridad_id',
    ];

    public function nivelSeguridad(): BelongsTo
    {
        return $this->belongsTo(NivelSeguridad::class, 'nivel_seguridad_id');
    }
}
```

### 4. Modificar `Personal.php`

```php
// Agregar a $fillable:
'nivel_seguridad_id',

// Agregar relación:
public function nivelSeguridad(): BelongsTo
{
    return $this->belongsTo(NivelSeguridad::class, 'nivel_seguridad_id');
}
```

### 5. Controller: `NivelSeguridadController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\NivelSeguridad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NivelSeguridadController extends Controller
{
    public function index(): JsonResponse
    {
        $niveles = NivelSeguridad::orderBy('nivel')->get();
        return response()->json($niveles);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'nivel' => 'required|integer|min:1|max:10|unique:niveles_seguridad,nivel',
            'color' => 'nullable|string|max:7',
            'descripcion' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $nivel = NivelSeguridad::create($validated);
        return response()->json(['success' => true, 'data' => $nivel], 201);
    }

    public function show(NivelSeguridad $nivelSeguridad): JsonResponse
    {
        return response()->json($nivelSeguridad);
    }

    public function update(Request $request, NivelSeguridad $nivelSeguridad): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:50',
            'nivel' => 'sometimes|required|integer|min:1|max:10|unique:niveles_seguridad,nivel,' . $nivelSeguridad->id,
            'color' => 'nullable|string|max:7',
            'descripcion' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $nivelSeguridad->update($validated);
        return response()->json(['success' => true, 'data' => $nivelSeguridad]);
    }

    public function destroy(NivelSeguridad $nivelSeguridad): JsonResponse
    {
        $nivelSeguridad->delete();
        return response()->json(['success' => true, 'message' => 'Nivel eliminado']);
    }

    // Lista para combos (solo activos)
    public function list(): JsonResponse
    {
        $niveles = NivelSeguridad::where('is_active', true)
            ->orderBy('nivel')
            ->get(['id', 'nombre', 'nivel', 'color']);
        
        return response()->json($niveles->map(fn($n) => [
            'value' => $n->id,
            'label' => "{$n->nombre} (Nivel {$n->nivel})",
            'color' => $n->color,
        ]));
    }
}
```

### 6. Controller: `ComponenteSeguridadController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\ComponenteSeguridad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComponenteSeguridadController extends Controller
{
    // Obtener todos los componentes con su nivel
    public function index(): JsonResponse
    {
        $componentes = ComponenteSeguridad::with('nivelSeguridad:id,nombre,nivel,color')->get();
        return response()->json($componentes);
    }

    // Asignar/actualizar nivel a un componente (upsert)
    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'componente_id' => 'required|string|max:100',
            'pagina' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'nivel_seguridad_id' => 'required|exists:niveles_seguridad,id',
        ]);

        $componente = ComponenteSeguridad::updateOrCreate(
            ['componente_id' => $validated['componente_id']],
            $validated
        );

        return response()->json([
            'success' => true,
            'data' => $componente->load('nivelSeguridad:id,nombre,nivel,color')
        ]);
    }

    // Eliminar nivel de un componente
    public function destroy(string $componenteId): JsonResponse
    {
        $deleted = ComponenteSeguridad::where('componente_id', $componenteId)->delete();
        return response()->json([
            'success' => $deleted > 0,
            'message' => $deleted > 0 ? 'Componente liberado' : 'Componente no encontrado'
        ]);
    }
}
```

### 7. Rutas: Agregar a `routes/api.php`

```php
use App\Http\Controllers\NivelSeguridadController;
use App\Http\Controllers\ComponenteSeguridadController;

// Niveles de Seguridad
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/niveles-seguridad', [NivelSeguridadController::class, 'index']);
    Route::get('/niveles-seguridad/list', [NivelSeguridadController::class, 'list']);
    Route::post('/niveles-seguridad', [NivelSeguridadController::class, 'store']);
    Route::get('/niveles-seguridad/{nivelSeguridad}', [NivelSeguridadController::class, 'show']);
    Route::put('/niveles-seguridad/{nivelSeguridad}', [NivelSeguridadController::class, 'update']);
    Route::delete('/niveles-seguridad/{nivelSeguridad}', [NivelSeguridadController::class, 'destroy']);

    // Componentes con Seguridad
    Route::get('/componentes-seguridad', [ComponenteSeguridadController::class, 'index']);
    Route::post('/componentes-seguridad', [ComponenteSeguridadController::class, 'upsert']);
    Route::delete('/componentes-seguridad/{componenteId}', [ComponenteSeguridadController::class, 'destroy']);
});
```

---

## Frontend (React)

### 1. Servicio: `services/securityLevelService.js`

```javascript
import { api } from './api';

// ========================
// NIVELES DE SEGURIDAD
// ========================
export const getNiveles = async () => {
    const response = await api.get('/niveles-seguridad');
    return response.data;
};

export const getNivelesList = async () => {
    const response = await api.get('/niveles-seguridad/list');
    return response.data;
};

export const createNivel = async (data) => {
    const response = await api.post('/niveles-seguridad', data);
    return response.data;
};

export const updateNivel = async (id, data) => {
    const response = await api.put(`/niveles-seguridad/${id}`, data);
    return response.data;
};

export const deleteNivel = async (id) => {
    const response = await api.delete(`/niveles-seguridad/${id}`);
    return response.data;
};

// ========================
// COMPONENTES CON SEGURIDAD
// ========================
export const getComponentesSecurity = async () => {
    const response = await api.get('/componentes-seguridad');
    return response.data;
};

export const setComponenteSecurity = async (data) => {
    const response = await api.post('/componentes-seguridad', data);
    return response.data;
};

export const removeComponenteSecurity = async (componenteId) => {
    const response = await api.delete(`/componentes-seguridad/${componenteId}`);
    return response.data;
};
```

### 2. Context: `core/SecurityContext.jsx`

```jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getComponentesSecurity, getNivelesList } from '../services/securityLevelService';

const SecurityContext = createContext(null);

export function SecurityProvider({ children, user }) {
    const [componentes, setComponentes] = useState({});  // { componenteId: nivelRequerido }
    const [niveles, setNiveles] = useState([]);
    const [userLevel, setUserLevel] = useState(0);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Cargar datos al montar
    const loadSecurityData = useCallback(async () => {
        try {
            const [componentesRes, nivelesRes] = await Promise.all([
                getComponentesSecurity(),
                getNivelesList()
            ]);

            // Mapear componentes a { componenteId: nivelNumerico }
            const componentesMap = {};
            componentesRes.forEach(c => {
                componentesMap[c.componente_id] = c.nivel_seguridad?.nivel || 0;
            });

            setComponentes(componentesMap);
            setNiveles(nivelesRes);
        } catch (error) {
            console.error('Error loading security data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSecurityData();
    }, [loadSecurityData]);

    // Actualizar nivel del usuario cuando cambia
    useEffect(() => {
        if (user) {
            // Asumir que user.personal.nivel_seguridad.nivel viene del backend
            setUserLevel(user.personal?.nivel_seguridad?.nivel || 0);
            setIsSuperAdmin(user.roles?.some(r => r.slug === 'superadmin') || false);
        }
    }, [user]);

    // Verificar si el usuario puede acceder a un componente
    const canAccess = useCallback((componenteId) => {
        // SuperAdmin siempre tiene acceso
        if (isSuperAdmin) return true;
        
        // Si el componente no tiene nivel asignado, es público
        const nivelRequerido = componentes[componenteId];
        if (nivelRequerido === undefined) return true;
        
        // Comparar niveles
        return userLevel >= nivelRequerido;
    }, [componentes, userLevel, isSuperAdmin]);

    // Actualizar componentes después de cambio
    const refreshComponents = useCallback(async () => {
        const componentesRes = await getComponentesSecurity();
        const componentesMap = {};
        componentesRes.forEach(c => {
            componentesMap[c.componente_id] = c.nivel_seguridad?.nivel || 0;
        });
        setComponentes(componentesMap);
    }, []);

    const value = {
        canAccess,
        isSuperAdmin,
        userLevel,
        niveles,
        componentes,
        refreshComponents,
        loading,
    };

    return (
        <SecurityContext.Provider value={value}>
            {children}
        </SecurityContext.Provider>
    );
}

export function useSecurity() {
    const context = useContext(SecurityContext);
    if (!context) {
        throw new Error('useSecurity must be used within SecurityProvider');
    }
    return context;
}
```

### 3. Componente: `ds-forms/SecuredButton.jsx`

```jsx
import React, { useState } from 'react';
import { Settings, Check } from 'lucide-react';
import { useSecurity } from '../core/SecurityContext';
import { setComponenteSecurity, removeComponenteSecurity } from '../services/securityLevelService';
import { DSButton } from './DSButton';
import './SecuredButton.css';

/**
 * SecuredButton - Botón con control de seguridad
 * 
 * @param {string} securityId - ID único del botón para seguridad (ej: "usuarios.crear")
 * @param {string} securityPage - Página donde está el botón (ej: "/sistemas/usuarios")
 * @param {string} securityDesc - Descripción del botón
 * Resto de props se pasan a DSButton
 */
export function SecuredButton({
    securityId,
    securityPage = window.location.pathname,
    securityDesc,
    children,
    ...buttonProps
}) {
    const { canAccess, isSuperAdmin, niveles, componentes, refreshComponents } = useSecurity();
    const [showConfig, setShowConfig] = useState(false);
    const [saving, setSaving] = useState(false);

    // Si no está definido securityId, actúa como DSButton normal
    if (!securityId) {
        return <DSButton {...buttonProps}>{children}</DSButton>;
    }

    // Verificar acceso
    const hasAccess = canAccess(securityId);
    const currentLevel = componentes[securityId];

    // Si no tiene acceso y no es superadmin, no renderizar
    if (!hasAccess && !isSuperAdmin) {
        return null;
    }

    // Handler para asignar nivel
    const handleSetLevel = async (nivelId) => {
        setSaving(true);
        try {
            if (nivelId === null) {
                await removeComponenteSecurity(securityId);
            } else {
                await setComponenteSecurity({
                    componente_id: securityId,
                    pagina: securityPage,
                    descripcion: securityDesc || children?.toString() || securityId,
                    nivel_seguridad_id: nivelId,
                });
            }
            await refreshComponents();
        } catch (error) {
            console.error('Error setting security level:', error);
        } finally {
            setSaving(false);
            setShowConfig(false);
        }
    };

    return (
        <div className="secured-button">
            <DSButton {...buttonProps}>{children}</DSButton>
            
            {/* Mini botón de configuración (solo superadmin) */}
            {isSuperAdmin && (
                <div className="secured-button__config">
                    <button
                        className={`secured-button__trigger ${currentLevel !== undefined ? 'has-level' : ''}`}
                        onClick={() => setShowConfig(!showConfig)}
                        title="Configurar nivel de seguridad"
                    >
                        <Settings size={10} />
                    </button>

                    {/* Popover de selección */}
                    {showConfig && (
                        <div className="secured-button__popover">
                            <div className="secured-button__popover-header">
                                Nivel de seguridad
                            </div>
                            <div className="secured-button__popover-options">
                                {/* Opción: Sin restricción */}
                                <button
                                    className={`secured-button__option ${currentLevel === undefined ? 'is-active' : ''}`}
                                    onClick={() => handleSetLevel(null)}
                                    disabled={saving}
                                >
                                    <span className="secured-button__option-dot" style={{ background: '#9ca3af' }} />
                                    <span>Sin restricción</span>
                                    {currentLevel === undefined && <Check size={12} />}
                                </button>

                                {/* Opciones de niveles */}
                                {niveles.map(nivel => (
                                    <button
                                        key={nivel.value}
                                        className={`secured-button__option ${currentLevel === nivel.nivel ? 'is-active' : ''}`}
                                        onClick={() => handleSetLevel(nivel.value)}
                                        disabled={saving}
                                    >
                                        <span 
                                            className="secured-button__option-dot"
                                            style={{ background: nivel.color }}
                                        />
                                        <span>{nivel.label}</span>
                                        {currentLevel === nivel.nivel && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

### 4. Estilos: `ds-forms/SecuredButton.css`

```css
.secured-button {
    position: relative;
    display: inline-flex;
}

.secured-button__config {
    position: absolute;
    top: -4px;
    right: -4px;
    z-index: 10;
}

.secured-button__trigger {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e5e7eb;
    border: 1px solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
}

.secured-button__trigger:hover {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.secured-button__trigger.has-level {
    background: #fbbf24;
    border-color: #f59e0b;
    color: #78350f;
}

.secured-button__popover {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    z-index: 100;
}

.secured-button__popover-header {
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #f3f4f6;
}

.secured-button__popover-options {
    padding: 4px;
}

.secured-button__option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: #374151;
    text-align: left;
    transition: background 0.15s;
}

.secured-button__option:hover {
    background: #f3f4f6;
}

.secured-button__option.is-active {
    background: #eff6ff;
    color: #1d4ed8;
}

.secured-button__option-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
```

### 5. Uso del SecuredButton

```jsx
// En lugar de:
<DSButton variant="primary" onClick={handleCreate}>
    Crear Usuario
</DSButton>

// Usar:
<SecuredButton 
    securityId="usuarios.crear" 
    variant="primary" 
    onClick={handleCreate}
>
    Crear Usuario
</SecuredButton>
```

### 6. Wrappear App con SecurityProvider

En `App.jsx` o componente principal:

```jsx
import { SecurityProvider } from './core/SecurityContext';

function App() {
    const { user } = useAuth(); // Tu hook de autenticación
    
    return (
        <SecurityProvider user={user}>
            {/* Resto de la app */}
        </SecurityProvider>
    );
}
```

---

## Comandos para Ejecutar

```powershell
# 1. Ejecutar migración
cd c:\Users\Ali\Desktop\proyectos\ProyectoZdemo\api_laravel
php artisan migrate

# 2. Crear niveles iniciales (opcional - ejecutar en tinker)
php artisan tinker
>>> App\Models\NivelSeguridad::create(['nombre' => 'Público', 'nivel' => 1, 'color' => '#22c55e']);
>>> App\Models\NivelSeguridad::create(['nombre' => 'Básico', 'nivel' => 3, 'color' => '#3b82f6']);
>>> App\Models\NivelSeguridad::create(['nombre' => 'Medio', 'nivel' => 5, 'color' => '#f59e0b']);
>>> App\Models\NivelSeguridad::create(['nombre' => 'Alto', 'nivel' => 7, 'color' => '#ef4444']);
>>> App\Models\NivelSeguridad::create(['nombre' => 'Crítico', 'nivel' => 10, 'color' => '#7c3aed']);
>>> exit
```

---

## Checklist de Implementación

### Backend
- [ ] Crear migración `2025_12_23_165000_create_security_levels_tables.php`
- [ ] Crear modelo `NivelSeguridad.php`
- [ ] Crear modelo `ComponenteSeguridad.php`
- [ ] Modificar modelo `Personal.php` (agregar relación)
- [ ] Crear `NivelSeguridadController.php`
- [ ] Crear `ComponenteSeguridadController.php`
- [ ] Agregar rutas a `api.php`
- [ ] Ejecutar `php artisan migrate`

### Frontend
- [ ] Crear `services/securityLevelService.js`
- [ ] Crear `core/SecurityContext.jsx`
- [ ] Crear `ds-forms/SecuredButton.jsx`
- [ ] Crear `ds-forms/SecuredButton.css`
- [ ] Wrappear App con `SecurityProvider`
- [ ] (Opcional) Crear página CRUD para niveles

### Testing
- [ ] Crear niveles de prueba
- [ ] Asignar nivel a botón como superadmin
- [ ] Verificar que usuario sin nivel no ve el botón
- [ ] Verificar que usuario con nivel suficiente sí lo ve
