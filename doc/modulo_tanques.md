# Módulo de Gestión de Tanques

Documentación para implementar el módulo de Tanques de combustible con funcionalidad visual de alertas (sin envío de notificaciones).

---

## Estructura de Archivos

```
src/
├── pages/
│   └── diesel/
│       ├── TanquesPage.jsx      # Componente principal
│       └── TanquesPage.css      # Estilos del módulo
└── services/
    └── dieselService.js         # Servicio API (funciones de tanques)
```

---

## Base de Datos

### Tabla: `tanques`

```sql
CREATE TABLE tanques (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    tipo ENUM('ESTATICO', 'MOVIL') DEFAULT 'ESTATICO',
    capacidad_litros DECIMAL(12,2) NOT NULL,
    nivel_actual DECIMAL(12,2) DEFAULT 0,
    nivel_minimo_alerta DECIMAL(12,2) DEFAULT 0,
    ubicacion_fija VARCHAR(255) NULL,          -- Solo para ESTATICO
    placa_cisterna VARCHAR(20) NULL,           -- Solo para MOVIL
    responsable_id BIGINT NULL,                -- FK a tabla personal
    is_active BOOLEAN DEFAULT TRUE,
    observaciones TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (responsable_id) REFERENCES personal(id)
);
```

### Campo calculado en respuesta API

```php
// En el modelo o controlador, añadir campo nivel_bajo
'nivel_bajo' => $tanque->nivel_actual <= $tanque->nivel_minimo_alerta,
'tipo_descripcion' => $tanque->tipo === 'MOVIL' ? 'Cisterna' : 'Fijo',
```

---

## Backend (Laravel)

### Controlador: `TanqueController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Tanque;
use Illuminate\Http\Request;

class TanqueController extends Controller
{
    public function index()
    {
        $tanques = Tanque::with('responsable')
            ->orderBy('tipo')
            ->orderBy('nombre')
            ->get()
            ->map(function ($tanque) {
                return [
                    ...$tanque->toArray(),
                    'nivel_bajo' => $tanque->nivel_actual <= $tanque->nivel_minimo_alerta,
                    'tipo_descripcion' => $tanque->tipo === 'MOVIL' ? 'Cisterna' : 'Fijo',
                ];
            });

        return response()->json(['success' => true, 'data' => $tanques]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:50|unique:tanques',
            'tipo' => 'required|in:ESTATICO,MOVIL',
            'capacidad_litros' => 'required|numeric|min:1',
            'nivel_actual' => 'nullable|numeric|min:0',
            'nivel_minimo_alerta' => 'nullable|numeric|min:0',
            'ubicacion_fija' => 'nullable|string|max:255',
            'placa_cisterna' => 'nullable|string|max:20',
            'responsable_id' => 'nullable|exists:personal,id',
            'is_active' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        $tanque = Tanque::create($validated);
        return response()->json(['success' => true, 'data' => $tanque], 201);
    }

    public function update(Request $request, Tanque $tanque)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:50|unique:tanques,codigo,' . $tanque->id,
            'tipo' => 'required|in:ESTATICO,MOVIL',
            'capacidad_litros' => 'required|numeric|min:1',
            'nivel_actual' => 'nullable|numeric|min:0',
            'nivel_minimo_alerta' => 'nullable|numeric|min:0',
            'ubicacion_fija' => 'nullable|string|max:255',
            'placa_cisterna' => 'nullable|string|max:20',
            'responsable_id' => 'nullable|exists:personal,id',
            'is_active' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        $tanque->update($validated);
        return response()->json(['success' => true, 'data' => $tanque]);
    }

    public function destroy(Tanque $tanque)
    {
        $tanque->delete();
        return response()->json(['success' => true, 'message' => 'Tanque eliminado']);
    }
}
```

### Rutas: `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('diesel/tanques', TanqueController::class);
});
```

---

## Frontend (React)

### Servicio API: `dieselService.js`

```javascript
import { authFetch } from './authService';

const API_BASE = '/api/diesel';

// ============ TANQUES ============
export async function fetchTanques() {
    try {
        const response = await authFetch(`${API_BASE}/tanques`);
        return { success: true, data: response.data || response };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createTanque(data) {
    try {
        const response = await authFetch(`${API_BASE}/tanques`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { success: true, data: response.data || response };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateTanque(id, data) {
    try {
        const response = await authFetch(`${API_BASE}/tanques/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { success: true, data: response.data || response };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteTanque(id) {
    try {
        await authFetch(`${API_BASE}/tanques/${id}`, { method: 'DELETE' });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

## Componentes React

### 1. TanqueGauge - Indicador Visual de Nivel

```jsx
function TanqueGauge({ nivel, capacidad, size = 'normal' }) {
    const porcentaje = capacidad > 0 ? Math.round((nivel / capacidad) * 100) : 0;

    let colorClass = 'gauge-high';
    if (porcentaje <= 20) colorClass = 'gauge-critical';
    else if (porcentaje <= 40) colorClass = 'gauge-low';
    else if (porcentaje <= 60) colorClass = 'gauge-medium';

    return (
        <div className={`tanque-gauge tanque-gauge--${size}`}>
            <div className="tanque-gauge__container">
                <div
                    className={`tanque-gauge__fill ${colorClass}`}
                    style={{ height: `${porcentaje}%` }}
                />
                <div className="tanque-gauge__label">{porcentaje}%</div>
            </div>
            <div className="tanque-gauge__info">
                <span className="tanque-gauge__nivel">{nivel.toLocaleString()} L</span>
                <span className="tanque-gauge__capacidad">/ {capacidad.toLocaleString()} L</span>
            </div>
        </div>
    );
}
```

### 2. TanqueCard - Tarjeta de Tanque

```jsx
function TanqueCard({ tanque, onEdit, onDelete }) {
    const esMovil = tanque.tipo === 'MOVIL';

    return (
        <div className={`tanque-card ${tanque.nivel_bajo ? 'tanque-card--alerta' : ''}`}>
            <div className="tanque-card__header">
                <div className="tanque-card__tipo">
                    {esMovil ? (
                        <Truck size={18} className="icon-movil" />
                    ) : (
                        <Factory size={18} className="icon-estatico" />
                    )}
                    <DSBadge variant={esMovil ? 'info' : 'default'} size="sm">
                        {tanque.tipo_descripcion}
                    </DSBadge>
                </div>
                {tanque.nivel_bajo && (
                    <DSBadge variant="warning" size="sm">
                        <AlertTriangle size={12} /> Nivel Bajo
                    </DSBadge>
                )}
            </div>

            <h3 className="tanque-card__nombre">{tanque.nombre}</h3>
            {tanque.codigo && (
                <span className="tanque-card__codigo">{tanque.codigo}</span>
            )}

            <TanqueGauge
                nivel={tanque.nivel_actual}
                capacidad={tanque.capacidad_litros}
            />

            <div className="tanque-card__detalles">
                {esMovil ? (
                    <>
                        <div className="tanque-card__detalle">
                            <Truck size={14} />
                            <span>Placa: <strong>{tanque.placa_cisterna}</strong></span>
                        </div>
                        {tanque.responsable && (
                            <div className="tanque-card__detalle">
                                <span>Responsable: {tanque.responsable.nombre_completo}</span>
                            </div>
                        )}
                    </>
                ) : (
                    tanque.ubicacion_fija && (
                        <div className="tanque-card__detalle">
                            <MapPin size={14} />
                            <span>{tanque.ubicacion_fija}</span>
                        </div>
                    )
                )}
            </div>

            <div className="tanque-card__footer">
                <DSBadge variant={tanque.is_active ? 'success' : 'neutral'} size="sm">
                    {tanque.is_active ? 'Activo' : 'Inactivo'}
                </DSBadge>
                <div className="tanque-card__actions">
                    <DSButton
                        size="sm"
                        iconOnly
                        icon={<Edit2 size={14} />}
                        onClick={() => onEdit(tanque)}
                        title="Editar"
                    />
                    <DSButton
                        size="sm"
                        variant="outline-danger"
                        iconOnly
                        icon={<Trash2 size={14} />}
                        onClick={() => onDelete(tanque)}
                        title="Eliminar"
                    />
                </div>
            </div>
        </div>
    );
}
```

### 3. TanqueForm - Modal de Formulario

```jsx
function TanqueForm({ isOpen, onClose, onSave, editData, responsables }) {
    const [form, setForm] = useState({
        nombre: '',
        codigo: '',
        tipo: 'ESTATICO',
        capacidad_litros: '',
        nivel_actual: '',
        nivel_minimo_alerta: '',
        ubicacion_fija: '',
        placa_cisterna: '',
        responsable_id: '',
        is_active: true,
        observaciones: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editData) {
            setForm({
                nombre: editData.nombre || '',
                codigo: editData.codigo || '',
                tipo: editData.tipo || 'ESTATICO',
                capacidad_litros: editData.capacidad_litros || '',
                nivel_actual: editData.nivel_actual || '',
                nivel_minimo_alerta: editData.nivel_minimo_alerta || '',
                ubicacion_fija: editData.ubicacion_fija || '',
                placa_cisterna: editData.placa_cisterna || '',
                responsable_id: editData.responsable_id || '',
                is_active: editData.is_active ?? true,
                observaciones: editData.observaciones || '',
            });
        } else {
            setForm({
                nombre: '',
                codigo: '',
                tipo: 'ESTATICO',
                capacidad_litros: '',
                nivel_actual: '0',
                nivel_minimo_alerta: '',
                ubicacion_fija: '',
                placa_cisterna: '',
                responsable_id: '',
                is_active: true,
                observaciones: '',
            });
        }
        setError(null);
    }, [editData, isOpen]);

    const handleChange = (field) => (e) => {
        const value = e.target ? e.target.value : e;
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }
        if (!form.capacidad_litros || parseFloat(form.capacidad_litros) <= 0) {
            setError('La capacidad debe ser mayor a 0');
            return;
        }
        if (form.tipo === 'MOVIL' && !form.placa_cisterna.trim()) {
            setError('La placa es requerida para tanques móviles');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload = {
                ...form,
                capacidad_litros: parseFloat(form.capacidad_litros),
                nivel_actual: parseFloat(form.nivel_actual) || 0,
                nivel_minimo_alerta: parseFloat(form.nivel_minimo_alerta) || 0,
                responsable_id: form.responsable_id ? parseInt(form.responsable_id) : null,
            };

            const result = editData
                ? await updateTanque(editData.id, payload)
                : await createTanque(payload);

            if (result.success) {
                onSave();
                onClose();
            } else {
                setError(result.error || 'Error guardando');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const tipoOptions = [
        { value: 'ESTATICO', label: '🏭 Estático (Fijo en planta)' },
        { value: 'MOVIL', label: '🚚 Móvil (Cisterna)' },
    ];

    const responsableOptions = [
        { value: '', label: 'Sin responsable asignado' },
        ...responsables.map(r => ({
            value: r.id.toString(),
            label: r.nombre_completo
        }))
    ];

    const esMovil = form.tipo === 'MOVIL';

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? 'Editar Tanque' : 'Nuevo Tanque'}
            size="lg"
            footer={
                <>
                    <DSButton onClick={onClose} disabled={saving}>
                        Cancelar
                    </DSButton>
                    <DSButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={saving}
                        loading={saving}
                        icon={!saving && <Save size={16} />}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </DSButton>
                </>
            }
        >
            {error && (
                <DSAlert variant="error" dismissible onDismiss={() => setError(null)} className="mb-3">
                    {error}
                </DSAlert>
            )}

            <div className="tanque-form">
                {/* Tipo de Tanque */}
                <DSFieldsGrid columns={2}>
                    <DSComboBox
                        label="Tipo de Tanque"
                        value={form.tipo}
                        onChange={handleChange('tipo')}
                        options={tipoOptions}
                        required
                        editable={false}
                        tooltip="Estático: fijo en planta. Móvil: cisterna que va a campo."
                    />
                    <DSTextField
                        label="Código"
                        value={form.codigo}
                        onChange={handleChange('codigo')}
                        placeholder="TP-001"
                        tooltip="Código único de identificación"
                    />
                </DSFieldsGrid>

                {/* Nombre */}
                <DSTextField
                    label="Nombre del Tanque"
                    value={form.nombre}
                    onChange={handleChange('nombre')}
                    required
                    placeholder="Ej: Tanque Principal Base"
                />

                {/* Capacidad y Niveles */}
                <DSFieldsGrid columns={3}>
                    <DSTextField
                        label="Capacidad (Litros)"
                        value={form.capacidad_litros}
                        onChange={handleChange('capacidad_litros')}
                        type="number"
                        required
                        placeholder="10000"
                        tooltip="Capacidad máxima del tanque"
                    />
                    <DSTextField
                        label="Nivel Actual (Litros)"
                        value={form.nivel_actual}
                        onChange={handleChange('nivel_actual')}
                        type="number"
                        placeholder="0"
                        tooltip="Cantidad de combustible actualmente"
                    />
                    <DSTextField
                        label="Nivel Mínimo Alerta"
                        value={form.nivel_minimo_alerta}
                        onChange={handleChange('nivel_minimo_alerta')}
                        type="number"
                        placeholder="1000"
                        tooltip="Se mostrará alerta visual cuando el nivel sea menor o igual"
                    />
                </DSFieldsGrid>

                {/* Campos según tipo */}
                {esMovil ? (
                    <DSFieldsGrid columns={2}>
                        <DSTextField
                            label="Placa de Cisterna"
                            value={form.placa_cisterna}
                            onChange={handleChange('placa_cisterna')}
                            required
                            placeholder="ABC-1234"
                            tooltip="Placa del vehículo cisterna"
                        />
                        <DSComboBox
                            label="Responsable"
                            value={form.responsable_id}
                            onChange={handleChange('responsable_id')}
                            options={responsableOptions}
                            tooltip="Persona responsable de la cisterna"
                        />
                    </DSFieldsGrid>
                ) : (
                    <DSTextField
                        label="Ubicación"
                        value={form.ubicacion_fija}
                        onChange={handleChange('ubicacion_fija')}
                        placeholder="Ej: Planta Central - Zona de Despacho"
                        tooltip="Ubicación física del tanque"
                    />
                )}

                {/* Estado */}
                <DSFieldsGrid columns={2}>
                    <DSComboBox
                        label="Estado"
                        value={form.is_active ? 'true' : 'false'}
                        onChange={(e) => setForm(prev => ({
                            ...prev,
                            is_active: e.target.value === 'true'
                        }))}
                        options={[
                            { value: 'true', label: 'Activo' },
                            { value: 'false', label: 'Inactivo' },
                        ]}
                    />
                </DSFieldsGrid>

                {/* Observaciones */}
                <DSTextArea
                    label="Observaciones"
                    value={form.observaciones}
                    onChange={handleChange('observaciones')}
                    placeholder="Notas adicionales..."
                    rows={2}
                />
            </div>
        </DSModal>
    );
}
```

### 4. Custom Hook: useTanques

```jsx
const POLLING_INTERVAL = 60000; // 60 segundos

function useTanques() {
    const [tanques, setTanques] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        
        try {
            const [tanquesResult, personalResult] = await Promise.all([
                fetchTanques(),
                fetchPersonal()  // Servicio para obtener lista de personal
            ]);

            if (tanquesResult.success) {
                setTanques(tanquesResult.data || []);
            } else {
                setError(tanquesResult.error || 'Error cargando tanques');
            }

            if (personalResult.success) {
                setResponsables(personalResult.data || []);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    // Carga inicial
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Polling automático (actualización silenciosa)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(false);
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchData]);

    return { tanques, responsables, loading, error, refetch: fetchData };
}
```

### 5. Componente Principal: TanquesPage

```jsx
export function TanquesPage() {
    const { tanques, responsables, loading, error: loadError, refetch } = useTanques();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [alert, setAlert] = useState(null);

    // Filtrar tanques
    const filteredTanques = tanques.filter(t => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchSearch =
                t.nombre?.toLowerCase().includes(term) ||
                t.codigo?.toLowerCase().includes(term) ||
                t.placa_cisterna?.toLowerCase().includes(term) ||
                t.ubicacion_fija?.toLowerCase().includes(term);
            if (!matchSearch) return false;
        }
        if (filterTipo && t.tipo !== filterTipo) return false;
        return true;
    });

    // Separar por tipo
    const estaticos = filteredTanques.filter(t => t.tipo === 'ESTATICO');
    const moviles = filteredTanques.filter(t => t.tipo === 'MOVIL');

    const handleCreate = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = (tanque) => {
        setEditData(tanque);
        setModalOpen(true);
    };

    const handleDelete = async (tanque) => {
        if (!window.confirm(`¿Eliminar el tanque "${tanque.nombre}"?`)) return;

        const result = await deleteTanque(tanque.id);
        if (result.success) {
            setAlert({ type: 'success', message: 'Tanque eliminado correctamente' });
            refetch();
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    const handleSave = () => {
        setAlert({ type: 'success', message: editData ? 'Tanque actualizado' : 'Tanque creado' });
        refetch();
    };

    if (loading) {
        return (
            <DSPage>
                <DSLoading text="Cargando tanques..." />
            </DSPage>
        );
    }

    return (
        <DSPage>
            <DSPageHeader
                title="Gestión de Tanques"
                icon={<Fuel size={22} />}
                actions={
                    <DSButton
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={handleCreate}
                    >
                        Nuevo Tanque
                    </DSButton>
                }
            />

            {alert && (
                <DSAlert
                    variant={alert.type}
                    dismissible
                    onDismiss={() => setAlert(null)}
                    className="mb-3"
                >
                    {alert.message}
                </DSAlert>
            )}

            {loadError && (
                <DSAlert variant="error" className="mb-3">
                    {loadError}
                </DSAlert>
            )}

            {/* Barra de filtros */}
            <DSSection style={{ overflow: 'visible', marginBottom: '24px' }}>
                <div className="tanques-toolbar">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código, placa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="tanques-filters">
                        <select
                            className="ds-combobox__select"
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--ds-fieldBorder)',
                                background: 'var(--ds-fieldBg)',
                                color: 'var(--ds-fieldText)',
                                minWidth: '180px',
                            }}
                        >
                            <option value="">Todos los tipos</option>
                            <option value="ESTATICO">🏭 Estáticos</option>
                            <option value="MOVIL">🚚 Móviles</option>
                        </select>
                        <DSButton size="sm" onClick={refetch}>
                            Actualizar
                        </DSButton>
                    </div>
                </div>
            </DSSection>

            {/* Tanques Estáticos */}
            {(filterTipo === '' || filterTipo === 'ESTATICO') && (
                <DSSection
                    title={
                        <span className="section-title-with-icon">
                            <Factory size={18} />
                            Tanques Estáticos
                            <DSBadge variant="neutral" size="sm">{estaticos.length}</DSBadge>
                        </span>
                    }
                >
                    {estaticos.length === 0 ? (
                        <DSEmpty
                            icon={<Factory size={48} />}
                            title="Sin tanques estáticos"
                            description="No hay tanques fijos registrados"
                        />
                    ) : (
                        <div className="tanques-grid">
                            {estaticos.map(tanque => (
                                <TanqueCard
                                    key={tanque.id}
                                    tanque={tanque}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </DSSection>
            )}

            {/* Tanques Móviles */}
            {(filterTipo === '' || filterTipo === 'MOVIL') && (
                <DSSection
                    title={
                        <span className="section-title-with-icon">
                            <Truck size={18} />
                            Tanques Móviles (Cisternas)
                            <DSBadge variant="neutral" size="sm">{moviles.length}</DSBadge>
                        </span>
                    }
                >
                    {moviles.length === 0 ? (
                        <DSEmpty
                            icon={<Truck size={48} />}
                            title="Sin tanques móviles"
                            description="No hay cisternas registradas"
                        />
                    ) : (
                        <div className="tanques-grid">
                            {moviles.map(tanque => (
                                <TanqueCard
                                    key={tanque.id}
                                    tanque={tanque}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </DSSection>
            )}

            {/* Modal de Formulario */}
            <TanqueForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editData={editData}
                responsables={responsables}
            />
        </DSPage>
    );
}
```

---

## Estilos CSS: `TanquesPage.css`

```css
/* Toolbar */
.tanques-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.tanques-filters {
    display: flex;
    gap: 12px;
    align-items: center;
}

/* Grid de Cards */
.tanques-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 8px 0;
}

/* Card de Tanque */
.tanque-card {
    background: var(--ds-sectionBg);
    border: 1px solid var(--ds-sectionBorder);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.2s ease;
}

.tanque-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

/* Alerta visual - borde amarillo cuando nivel bajo */
.tanque-card--alerta {
    border-color: var(--ds-warning);
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%);
}

.tanque-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tanque-card__tipo {
    display: flex;
    align-items: center;
    gap: 8px;
}

.tanque-card__tipo .icon-movil {
    color: var(--ds-info);
}

.tanque-card__tipo .icon-estatico {
    color: var(--ds-secondaryText);
}

.tanque-card__nombre {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ds-primaryText);
    margin: 0;
}

.tanque-card__codigo {
    font-size: 0.75rem;
    color: var(--ds-secondaryText);
    background: var(--ds-fieldBg);
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    width: fit-content;
}

.tanque-card__detalles {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--ds-secondaryText);
}

.tanque-card__detalle {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tanque-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--ds-sectionBorder);
    margin-top: auto;
}

.tanque-card__actions {
    display: flex;
    gap: 6px;
}

/* Gauge de Nivel */
.tanque-gauge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 0;
}

.tanque-gauge__container {
    width: 60px;
    height: 100px;
    background: var(--ds-fieldBg);
    border: 2px solid var(--ds-fieldBorder);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
}

.tanque-gauge__fill {
    width: 100%;
    transition: height 0.5s ease, background-color 0.3s;
    border-radius: 0 0 6px 6px;
}

.tanque-gauge__fill.gauge-high {
    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.tanque-gauge__fill.gauge-medium {
    background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
}

.tanque-gauge__fill.gauge-low {
    background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.tanque-gauge__fill.gauge-critical {
    background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
    animation: pulse-critical 1.5s infinite;
}

@keyframes pulse-critical {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.tanque-gauge__label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--ds-primaryText);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    z-index: 2;
}

.tanque-gauge__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.tanque-gauge__nivel {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ds-primaryText);
}

.tanque-gauge__capacidad {
    font-size: 0.75rem;
    color: var(--ds-secondaryText);
}

/* Section title with icon */
.section-title-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

/* Form styles */
.tanque-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Search box */
.search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--ds-fieldBg);
    border: 1px solid var(--ds-fieldBorder);
    border-radius: 8px;
    padding: 8px 12px;
    flex: 1;
    max-width: 400px;
}

.search-box input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    font-size: 0.9rem;
    color: var(--ds-fieldText);
}

.search-box input::placeholder {
    color: var(--ds-placeholderText);
}

.search-box svg {
    color: var(--ds-secondaryText);
}

/* Responsive */
@media (max-width: 768px) {
    .tanques-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .tanques-filters {
        justify-content: space-between;
    }

    .search-box {
        max-width: none;
    }

    .tanques-grid {
        grid-template-columns: 1fr;
    }
}
```

---

## Dependencias / Imports

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Fuel,
    Plus,
    Edit2,
    Trash2,
    Search,
    Save,
    AlertTriangle,
    Truck,
    Factory,
    MapPin,
} from 'lucide-react';

// Componentes del Design System
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSModal,
    DSTextField,
    DSTextArea,
    DSComboBox,
    DSFieldsGrid,
    DSEmpty,
} from '../../ds-components';

// Servicios
import { fetchTanques, createTanque, updateTanque, deleteTanque } from '../../services/dieselService';
import { fetchPersonal } from '../../services/personalService';

// Estilos
import './TanquesPage.css';
```

---

## Funcionalidad de Alertas (Solo Visual)

Este módulo incluye **alertas visuales** sin envío de notificaciones:

| Característica | Descripción |
|----------------|-------------|
| **`nivel_minimo_alerta`** | Campo en el formulario para definir umbral |
| **`nivel_bajo`** | Campo calculado en backend (`nivel_actual <= nivel_minimo_alerta`) |
| **Badge "Nivel Bajo"** | Se muestra en la tarjeta cuando `nivel_bajo = true` |
| **Borde amarillo** | La tarjeta tiene clase `.tanque-card--alerta` con borde de advertencia |
| **Gauge animado** | El indicador de nivel pulsa en rojo cuando está crítico (≤20%) |

### Color del Gauge según porcentaje:

| Porcentaje | Clase CSS | Color |
|------------|-----------|-------|
| > 60% | `gauge-high` | Verde intenso |
| 41-60% | `gauge-medium` | Verde claro |
| 21-40% | `gauge-low` | Amarillo/Naranja |
| ≤ 20% | `gauge-critical` | Rojo + animación |

---

## Notas de Implementación

1. **Sin SecuredButton**: Se usó `DSButton` estándar. Si necesitas control de acceso, implementa `SecuredButton`.

2. **Polling Automático**: Los datos se actualizan cada 60 segundos sin recargar la página.

3. **Personal/Responsables**: Requiere endpoint `/api/personal` para asignar responsables a cisternas.

4. **Variables CSS**: Asegúrate de tener definidas las variables del Design System (`--ds-*`).
