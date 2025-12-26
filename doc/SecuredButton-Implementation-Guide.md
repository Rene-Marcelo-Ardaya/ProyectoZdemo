# Guía de Implementación: Sistema de Seguridad por Grupos (SecuredButton)

Este documento explica cómo implementar un sistema de control de acceso basado en grupos para botones y acciones en una aplicación **Laravel API + React**.

---

## Resumen del Sistema

El sistema permite:
1. **Crear grupos de seguridad** (ej: "Administradores", "Ventas", "Soporte")
2. **Asignar empleados a grupos**
3. **Proteger botones/acciones** con un grupo específico
4. **Solo usuarios del grupo asignado** pueden ejecutar la acción

---

## 1. Backend (Laravel API)

### 1.1 Migraciones de Base de Datos

```php
// database/migrations/XXXX_create_security_levels_tables.php

Schema::create('niveles_seguridad', function (Blueprint $table) {
    $table->id();
    $table->string('nombre', 50)->unique();
    $table->string('color', 7)->default('#6b7280');
    $table->text('descripcion')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

Schema::create('componente_seguridad', function (Blueprint $table) {
    $table->id();
    $table->string('componente_id', 100)->unique(); // ej: "personal.crear"
    $table->foreignId('nivel_seguridad_id')->constrained('niveles_seguridad')->onDelete('cascade');
    $table->string('descripcion')->nullable();
    $table->timestamps();
});

// Agregar nivel_seguridad_id a la tabla de usuarios/personal
Schema::table('personal', function (Blueprint $table) {
    $table->foreignId('nivel_seguridad_id')->nullable()->constrained('niveles_seguridad')->nullOnDelete();
});
```

### 1.2 Modelos

```php
// app/Models/NivelSeguridad.php

class NivelSeguridad extends Model
{
    protected $table = 'niveles_seguridad';
    protected $fillable = ['nombre', 'color', 'descripcion', 'is_active'];

    public function personal() { return $this->hasMany(Persona::class, 'nivel_seguridad_id'); }
    public function componentes() { return $this->hasMany(ComponenteSeguridad::class, 'nivel_seguridad_id'); }

    public function scopeActivos($query) { return $query->where('is_active', true); }
}
```

```php
// app/Models/ComponenteSeguridad.php

class ComponenteSeguridad extends Model
{
    protected $table = 'componente_seguridad';
    protected $fillable = ['componente_id', 'nivel_seguridad_id', 'descripcion'];

    public function nivelSeguridad() { return $this->belongsTo(NivelSeguridad::class); }
}
```

### 1.3 Controladores

```php
// app/Http/Controllers/NivelSeguridadController.php

class NivelSeguridadController extends Controller
{
    public function index() {
        $niveles = NivelSeguridad::withCount(['personal', 'componentes'])
            ->orderBy('id')->get();
        return response()->json(['success' => true, 'data' => $niveles]);
    }

    public function activos() {
        $niveles = NivelSeguridad::activos()->orderBy('id')->get(['id', 'nombre', 'color']);
        return response()->json(['success' => true, 'data' => $niveles]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:niveles_seguridad',
            'color' => 'nullable|string|max:7',
            'descripcion' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        $nivel = NivelSeguridad::create($validated);
        return response()->json(['success' => true, 'data' => $nivel], 201);
    }

    public function update(Request $request, $id) {
        $nivel = NivelSeguridad::findOrFail($id);
        $nivel->update($request->validated());
        return response()->json(['success' => true, 'data' => $nivel]);
    }

    public function destroy($id) {
        $nivel = NivelSeguridad::withCount(['personal', 'componentes'])->findOrFail($id);
        if ($nivel->personal_count > 0 || $nivel->componentes_count > 0) {
            return response()->json(['success' => false, 'message' => 'No se puede eliminar'], 422);
        }
        $nivel->delete();
        return response()->json(['success' => true]);
    }
}
```

```php
// app/Http/Controllers/ComponenteSeguridadController.php

class ComponenteSeguridadController extends Controller
{
    public function index() {
        $componentes = ComponenteSeguridad::with('nivelSeguridad:id,nombre,color')->get();
        return response()->json(['success' => true, 'data' => $componentes]);
    }

    public function upsert(Request $request) {
        $validated = $request->validate([
            'componente_id' => 'required|string|max:100',
            'nivel_seguridad_id' => 'required|exists:niveles_seguridad,id',
            'descripcion' => 'nullable|string',
        ]);

        $componente = ComponenteSeguridad::updateOrCreate(
            ['componente_id' => $validated['componente_id']],
            $validated
        );

        return response()->json([
            'success' => true,
            'data' => $componente->load('nivelSeguridad:id,nombre,color')
        ]);
    }

    public function destroy($componenteId) {
        ComponenteSeguridad::where('componente_id', $componenteId)->delete();
        return response()->json(['success' => true]);
    }
}
```

### 1.4 Rutas API

```php
// routes/api.php

Route::middleware(['auth:sanctum'])->group(function () {
    // Niveles de Seguridad
    Route::get('/niveles-seguridad/activos', [NivelSeguridadController::class, 'activos']);
    Route::apiResource('niveles-seguridad', NivelSeguridadController::class);

    // Componentes con Seguridad
    Route::get('/componentes-seguridad', [ComponenteSeguridadController::class, 'index']);
    Route::post('/componentes-seguridad', [ComponenteSeguridadController::class, 'upsert']);
    Route::delete('/componentes-seguridad/{componenteId}', [ComponenteSeguridadController::class, 'destroy']);
});
```

---

## 2. Frontend (React)

### 2.1 Servicio de API

```javascript
// src/services/securityLevelService.js

import { authFetch } from './authService';

export async function fetchNivelesActivos() {
    const response = await authFetch('/niveles-seguridad/activos');
    const data = await response.json();
    return { success: response.ok, data: data.data || [] };
}

export async function fetchComponentesSecurity() {
    const response = await authFetch('/componentes-seguridad');
    const data = await response.json();
    return { success: response.ok, data: data.data || [] };
}

export async function setComponenteSecurity(componenteData) {
    const response = await authFetch('/componentes-seguridad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(componenteData),
    });
    const data = await response.json();
    return { success: response.ok, data: data.data };
}

export async function removeComponenteSecurity(componenteId) {
    const response = await authFetch(`/componentes-seguridad/${componenteId}`, {
        method: 'DELETE',
    });
    return { success: response.ok };
}
```

### 2.2 Context de Seguridad

```jsx
// src/core/SecurityContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchNivelesActivos, fetchComponentesSecurity } from '../services/securityLevelService';

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
    const [user, setUser] = useState(null);
    const [niveles, setNiveles] = useState([]);
    const [componentes, setComponentes] = useState({}); // { componenteId: nivelSeguridadId }
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [userLevel, setUserLevel] = useState(null); // ID del nivel del usuario

    // Cargar datos de seguridad
    useEffect(() => {
        const loadSecurityData = async () => {
            const [nivelesRes, componentesRes] = await Promise.all([
                fetchNivelesActivos(),
                fetchComponentesSecurity()
            ]);

            if (nivelesRes.success) setNiveles(nivelesRes.data);
            
            if (componentesRes.success) {
                const map = {};
                componentesRes.data.forEach(c => {
                    map[c.componente_id] = c.nivel_seguridad_id;
                });
                setComponentes(map);
            }
        };
        loadSecurityData();
    }, []);

    // Establecer nivel del usuario cuando se autentica
    useEffect(() => {
        if (user) {
            const nivelId = user.personal?.nivel_seguridad_id;
            setUserLevel(nivelId);
            setIsSuperAdmin(user.roles?.includes('superadmin'));
        }
    }, [user]);

    // Verificar acceso a un componente
    const canAccess = useCallback((componenteId) => {
        if (isSuperAdmin) return true;
        const nivelRequeridoId = componentes[componenteId];
        if (!nivelRequeridoId) return true; // Sin restricción
        return userLevel === nivelRequeridoId;
    }, [componentes, userLevel, isSuperAdmin]);

    // Obtener el nivel requerido de un componente
    const getRequiredLevel = useCallback((componenteId) => {
        return componentes[componenteId] || null;
    }, [componentes]);

    // Refrescar componentes después de cambios
    const refreshComponents = useCallback(async () => {
        const res = await fetchComponentesSecurity();
        if (res.success) {
            const map = {};
            res.data.forEach(c => { map[c.componente_id] = c.nivel_seguridad_id; });
            setComponentes(map);
        }
    }, []);

    const refreshNiveles = useCallback(async () => {
        const res = await fetchNivelesActivos();
        if (res.success) setNiveles(res.data);
    }, []);

    return (
        <SecurityContext.Provider value={{
            user, setUser,
            niveles, componentes,
            isSuperAdmin,
            userLevel,
            canAccess,
            getRequiredLevel,
            refreshComponents,
            refreshNiveles,
        }}>
            {children}
        </SecurityContext.Provider>
    );
}

export const useSecurity = () => useContext(SecurityContext);
```

### 2.3 Componente SecuredButton

```jsx
// src/ds-forms/SecuredButton.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Shield, Search, X } from 'lucide-react';
import { useSecurity } from '../core/SecurityContext';
import { setComponenteSecurity, removeComponenteSecurity } from '../services/securityLevelService';
import { DSButton } from '../ds-components';
import './SecuredButton.css';

export function SecuredButton({
    securityId,        // ID único: "modulo.accion" ej: "personal.crear"
    securityDesc,      // Descripción legible
    children,
    onClick,
    disabled,
    ...buttonProps
}) {
    const { 
        isSuperAdmin, 
        canAccess, 
        getRequiredLevel, 
        niveles, 
        refreshComponents 
    } = useSecurity();

    const [showMenu, setShowMenu] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const menuRef = useRef(null);

    const requiredLevelId = getRequiredLevel(securityId);
    const isBlocked = !canAccess(securityId);
    const hasRestriction = requiredLevelId !== null;

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtrar niveles por búsqueda
    const filteredNiveles = niveles.filter(n =>
        n.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Asignar nivel a este componente
    const handleAssign = async (nivelId) => {
        setSaving(true);
        await setComponenteSecurity({
            componente_id: securityId,
            nivel_seguridad_id: nivelId,
            descripcion: securityDesc
        });
        await refreshComponents();
        setSaving(false);
        setShowMenu(false);
    };

    // Liberar componente (quitar restricción)
    const handleRelease = async () => {
        setSaving(true);
        await removeComponenteSecurity(securityId);
        await refreshComponents();
        setSaving(false);
        setShowMenu(false);
    };

    // Obtener info del nivel asignado
    const assignedLevel = niveles.find(n => n.id === requiredLevelId);

    // Si NO es superadmin y está bloqueado, no mostrar nada
    if (!isSuperAdmin && isBlocked) {
        return null;
    }

    return (
        <div className="secured-button" ref={menuRef}>
            <DSButton
                onClick={onClick}
                disabled={disabled || isBlocked}
                {...buttonProps}
            >
                {children}
            </DSButton>

            {/* Indicador de seguridad (solo para superadmin) */}
            {isSuperAdmin && (
                <button
                    className={`secured-button__indicator ${hasRestriction ? 'has-restriction' : ''}`}
                    onClick={() => setShowMenu(!showMenu)}
                    title={hasRestriction ? `Restringido a: ${assignedLevel?.nombre}` : 'Configurar acceso'}
                    style={hasRestriction ? { backgroundColor: assignedLevel?.color } : {}}
                >
                    {hasRestriction ? <Lock size={10} /> : <Unlock size={10} />}
                </button>
            )}

            {/* Menú de configuración */}
            {showMenu && (
                <div className="secured-button__menu">
                    <div className="secured-button__menu-header">
                        <Shield size={14} />
                        <span>Configurar Acceso</span>
                        <button onClick={() => setShowMenu(false)}><X size={14} /></button>
                    </div>

                    <div className="secured-button__menu-info">
                        <code>{securityId}</code>
                        <small>{securityDesc}</small>
                    </div>

                    {/* Buscador */}
                    <div className="secured-button__search">
                        <Search size={12} />
                        <input
                            type="text"
                            placeholder="Buscar grupo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="secured-button__menu-options">
                        {/* Opción: Sin restricción */}
                        <button
                            className={`secured-button__menu-option ${!hasRestriction ? 'active' : ''}`}
                            onClick={handleRelease}
                            disabled={saving}
                        >
                            <Unlock size={14} />
                            <span>Sin restricción</span>
                        </button>

                        {/* Lista de niveles */}
                        {filteredNiveles.map(nivel => (
                            <button
                                key={nivel.id}
                                className={`secured-button__menu-option ${requiredLevelId === nivel.id ? 'active' : ''}`}
                                onClick={() => handleAssign(nivel.id)}
                                disabled={saving}
                            >
                                <span
                                    className="secured-button__color-dot"
                                    style={{ backgroundColor: nivel.color }}
                                />
                                <span>{nivel.nombre}</span>
                            </button>
                        ))}

                        {filteredNiveles.length === 0 && (
                            <div className="secured-button__no-results">
                                No se encontraron grupos
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
```

### 2.4 Estilos CSS

```css
/* src/ds-forms/SecuredButton.css */

.secured-button {
    display: inline-flex;
    align-items: center;
    position: relative;
}

.secured-button__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    margin-left: 4px;
    background: #e5e7eb;
    color: #6b7280;
    transition: all 0.2s;
}

.secured-button__indicator.has-restriction {
    color: white;
}

.secured-button__menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    min-width: 220px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    margin-top: 4px;
}

.secured-button__menu-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    font-size: 13px;
}

.secured-button__menu-info {
    padding: 8px 12px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.secured-button__menu-info code {
    font-size: 11px;
    background: #e5e7eb;
    padding: 2px 6px;
    border-radius: 4px;
}

.secured-button__menu-info small {
    display: block;
    margin-top: 4px;
    color: #6b7280;
    font-size: 11px;
}

.secured-button__search {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
}

.secured-button__search input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 12px;
    outline: none;
}

.secured-button__menu-options {
    max-height: 200px;
    overflow-y: auto;
    padding: 4px 0;
}

.secured-button__menu-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    text-align: left;
}

.secured-button__menu-option:hover {
    background: #f3f4f6;
}

.secured-button__menu-option.active {
    background: #eff6ff;
    color: #2563eb;
}

.secured-button__color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.secured-button__no-results {
    padding: 12px;
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
}
```

---

## 3. Uso del Componente

### 3.1 Importar y Usar

```jsx
import { SecuredButton } from '../ds-forms/SecuredButton';

// En tu página
<SecuredButton
    securityId="personal.crear"
    securityDesc="Crear Nuevo Personal"
    variant="primary"
    icon={<Plus size={16} />}
    onClick={handleCreate}
>
    Nuevo Personal
</SecuredButton>
```

### 3.2 Convención de IDs

Usa el formato `modulo.accion`:

| Security ID | Descripción |
|-------------|-------------|
| `personal.crear` | Crear nuevo personal |
| `personal.editar` | Editar personal |
| `personal.eliminar` | Eliminar personal |
| `usuarios.crear` | Crear usuario |
| `ventas.aprobar` | Aprobar ventas |
| `reportes.exportar` | Exportar reportes |

---

## 4. Flujo de Funcionamiento

1. **SuperAdmin** ve un indicador (🔓 o 🛡️) junto a cada botón
2. Al hacer clic en el indicador, aparece un menú para asignar un grupo
3. El botón queda restringido a ese grupo
4. **Usuarios normales**: 
   - Si pertenecen al grupo → ven y usan el botón
   - Si NO pertenecen → el botón se oculta completamente

---

## 5. Checklist de Implementación

- [ ] Crear migración de base de datos
- [ ] Crear modelos NivelSeguridad y ComponenteSeguridad
- [ ] Agregar nivel_seguridad_id a tabla de usuarios/personal
- [ ] Crear controladores
- [ ] Registrar rutas en api.php
- [ ] Crear securityLevelService.js
- [ ] Crear SecurityContext.jsx
- [ ] Crear componente SecuredButton.jsx
- [ ] Agregar estilos CSS
- [ ] Envolver App con SecurityProvider
- [ ] Reemplazar DSButton con SecuredButton donde sea necesario
