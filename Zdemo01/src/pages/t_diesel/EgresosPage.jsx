import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, Plus, Trash2, Save, Eye, Filter, Check, X, Truck, Settings2, HelpCircle, Image, RefreshCw } from 'lucide-react';
import CONFIG from '../../config';
import {
    getEgresos,
    getEgresosCombos,
    createEgreso,
    completarEgreso,
    anularEgreso,
    uploadFotoEgreso
} from '../../services/dieselService';

import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSModal,
    DSFieldsGrid,
    SecuredButton,
    DSRefreshButton,
} from '../../ds-components';

import { PhotoCapture } from '../../components/PhotoCapture';
import './DieselPages.css';

// Hook para cargar combos
function useEgresoCombos() {
    const [tanques, setTanques] = useState([]);
    const [maquinas, setMaquinas] = useState([]);
    const [trabajos, setTrabajos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCombos = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getEgresosCombos();
            if (result.success && result.data) {
                setTanques(result.data.tanques || []);
                setMaquinas(result.data.maquinas || []);
                setTrabajos(result.data.trabajos || []);
            }
        } catch (err) {
            console.error("Error cargando combos", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCombos();
    }, [fetchCombos]);

    return { tanques, maquinas, trabajos, loading, refetch: fetchCombos };
}

// Utilidad para fechas
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getDateMonthsAgo = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split('T')[0];
};

const INITIAL_FILTERS = {
    tipo: '',
    d_tanque_id: '',
    estado: '',
    fecha_inicio: getTodayStr(),
    fecha_fin: getTodayStr()
};

const INITIAL_FORM = {
    fecha: getTodayStr(),
    tipo: '',
    d_tanque_id: '',
    d_maquina_id: '',
    d_trabajo_id: '',
    personal_recibe_id: '',
    inicio_tanque: '',
    nombre_chofer: '',
    carnet_chofer: '',
    placa_vehiculo: '',
    observaciones: '',
    pin_entrega: ''
};

const INITIAL_COMPLETAR = {
    fin_tanque: '',
    litros: '',
    pin_recibo: '',
    horometro_final: ''
};

export function EgresosPage() {
    const { tanques, maquinas, trabajos, refetch: refetchCombos } = useEgresoCombos();

    // Data state
    const [egresos, setEgresos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [completarModalOpen, setCompletarModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewEgreso, setViewEgreso] = useState(null);
    const [completarEgresoData, setCompletarEgresoData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [completarForm, setCompletarForm] = useState(INITIAL_COMPLETAR);

    // Wizard step
    const [step, setStep] = useState(1);

    // Modal foto
    const [fotoModalOpen, setFotoModalOpen] = useState(false);
    const [fotoUrl, setFotoUrl] = useState(null);

    // Foto para completar egreso
    const [fotoEgreso, setFotoEgreso] = useState(null);

    // Fetch egresos
    const fetchEgresos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (filters.tipo) params.tipo = filters.tipo;
            if (filters.d_tanque_id) params.d_tanque_id = filters.d_tanque_id;
            if (filters.estado) params.estado = filters.estado;
            if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
            if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;

            const result = await getEgresos(params);
            setEgresos(result.data || []);
        } catch (err) {
            setError('Error cargando egresos');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchEgresos();
    }, [fetchEgresos]);

    // Filter handlers
    const handleFilterChange = (field) => (e) => {
        setFilters(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handlePeriodShortcut = (months) => {
        setFilters(prev => ({
            ...prev,
            fecha_inicio: getDateMonthsAgo(months),
            fecha_fin: getTodayStr()
        }));
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS);
    };

    // Form handlers
    const resetForm = () => {
        setForm({ ...INITIAL_FORM });
        setFormError(null);
        setStep(1);
    };

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setStep(1);
    };

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    // Wizard navigation
    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // Get selected tanque info
    const selectedTanque = useMemo(() => {
        return tanques.find(t => t.id === parseInt(form.d_tanque_id)) || null;
    }, [tanques, form.d_tanque_id]);

    // Get selected maquina info
    const selectedMaquina = useMemo(() => {
        return maquinas.find(m => m.id === parseInt(form.d_maquina_id)) || null;
    }, [maquinas, form.d_maquina_id]);

    // Validation
    const validateStep1 = () => {
        if (!form.tipo) return 'Seleccione el tipo de egreso';
        return null;
    };

    const validateStep2 = () => {
        if (!form.d_tanque_id) return 'Seleccione un tanque';
        if (!form.inicio_tanque || parseFloat(form.inicio_tanque) <= 0) return 'La lectura inicial es obligatoria';

        if (form.tipo === 'INTERNO') {
            if (!form.d_trabajo_id) return 'El trabajo es obligatorio para despachos internos';
            if (!form.d_maquina_id) return 'Seleccione una máquina';
        } else {
            if (!form.nombre_chofer) return 'El nombre del chofer es obligatorio';
            if (!form.carnet_chofer) return 'El carnet del chofer es obligatorio';
            if (!form.placa_vehiculo) return 'La placa del vehículo es obligatoria';
        }
        return null;
    };

    const validateStep3 = () => {
        if (!form.pin_entrega || form.pin_entrega.length !== 4) return 'El PIN debe tener 4 dígitos';
        return null;
    };

    const handleSubmit = async () => {
        const errorMsg = validateStep3();
        if (errorMsg) {
            setFormError(errorMsg);
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const payload = {
                fecha: form.fecha,
                d_tanque_id: form.d_tanque_id,
                tipo: form.tipo,
                d_trabajo_id: form.d_trabajo_id,
                inicio_tanque: form.inicio_tanque,
                pin_entrega: form.pin_entrega,
                observaciones: form.observaciones
            };

            if (form.tipo === 'INTERNO') {
                payload.d_maquina_id = form.d_maquina_id;
                if (form.personal_recibe_id) payload.personal_recibe_id = form.personal_recibe_id;
            } else {
                payload.nombre_chofer = form.nombre_chofer;
                payload.carnet_chofer = form.carnet_chofer;
                payload.placa_vehiculo = form.placa_vehiculo;
            }

            const result = await createEgreso(payload);

            if (result.success) {
                // Cerrar modal de creación
                closeModal();
                fetchEgresos();
                refetchCombos();

                // Abrir automáticamente el modal de Completar con el egreso recién creado
                if (result.data) {
                    setFormSuccess('Egreso iniciado. Complete el despacho a continuación.');
                    // Pequeño delay para asegurar que los combos se actualicen
                    setTimeout(() => {
                        openCompletarModal(result.data);
                    }, 300);
                } else {
                    setFormSuccess('Egreso iniciado. Pendiente de completar.');
                }
                setTimeout(() => setFormSuccess(null), 5000);
            } else {
                setFormError(result.message || 'Error al guardar');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    // Completar egreso - get maquina info for horómetro validation
    const getCompletarMaquina = useCallback((egreso) => {
        if (egreso?.tipo === 'INTERNO' && egreso?.maquina) {
            return maquinas.find(m => m.id === egreso.maquina.id) || egreso.maquina;
        }
        return null;
    }, [maquinas]);

    const openCompletarModal = (egreso) => {
        setCompletarEgresoData(egreso);
        const maquina = getCompletarMaquina(egreso);
        setCompletarForm({
            ...INITIAL_COMPLETAR,
            horometro_final: maquina?.horometro_actual || ''
        });
        setFotoEgreso(null); // Limpiar foto anterior
        setCompletarModalOpen(true);
        setFormError(null);
    };

    const handleCompletarChange = (field) => (e) => {
        setCompletarForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    // Calculate litros based on readings
    useEffect(() => {
        if (completarEgresoData) {
            const inicio = parseFloat(completarEgresoData.inicio_tanque) || 0;
            const fin = parseFloat(completarForm.fin_tanque) || 0;
            if (fin > 0 && inicio >= fin) {
                setCompletarForm(prev => ({ ...prev, litros: (inicio - fin).toFixed(2) }));
            }
        }
    }, [completarForm.fin_tanque, completarEgresoData]);

    const handleCompletar = async () => {
        if (!completarForm.fin_tanque || parseFloat(completarForm.fin_tanque) <= 0) {
            setFormError('La lectura final es obligatoria');
            return;
        }
        if (!completarForm.litros || parseFloat(completarForm.litros) <= 0) {
            setFormError('Los litros deben ser mayor a 0');
            return;
        }

        if (completarEgresoData.tipo === 'INTERNO') {
            if (!completarForm.pin_recibo || completarForm.pin_recibo.length !== 4) {
                setFormError('El PIN de recibo debe tener 4 dígitos');
                return;
            }
            if (!completarForm.horometro_final || parseFloat(completarForm.horometro_final) <= 0) {
                setFormError('El horómetro es obligatorio');
                return;
            }
            // Validar que horómetro no sea menor al actual de la máquina
            const maquina = getCompletarMaquina(completarEgresoData);
            const horometroActual = parseFloat(maquina?.horometro_actual || 0);
            if (parseFloat(completarForm.horometro_final) < horometroActual) {
                setFormError(`El horómetro no puede ser menor al actual (${horometroActual})`);
                return;
            }
        } else {
            // EXTERNO: foto obligatoria
            if (!fotoEgreso) {
                setFormError('La foto es obligatoria para egresos externos');
                return;
            }
        }

        setSaving(true);
        setFormError(null);

        try {
            const payload = {
                fin_tanque: completarForm.fin_tanque,
                litros: completarForm.litros
            };

            if (completarEgresoData.tipo === 'INTERNO') {
                payload.pin_recibo = completarForm.pin_recibo;
                if (completarForm.horometro_final) {
                    payload.horometro_final = completarForm.horometro_final;
                }
            }

            const result = await completarEgreso(completarEgresoData.id, payload);

            if (result.success) {
                // Subir foto si existe
                if (fotoEgreso) {
                    try {
                        await uploadFotoEgreso(completarEgresoData.id, fotoEgreso);
                    } catch (fotoErr) {
                        console.error('Error subiendo foto:', fotoErr);
                        // No bloquear el flujo si falla la foto
                    }
                }

                setFormSuccess('Egreso completado. Stock del tanque actualizado.');
                setCompletarModalOpen(false);
                setFotoEgreso(null);
                fetchEgresos();
                refetchCombos();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                setFormError(result.message || 'Error al completar');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleAnular = async (item) => {
        if (!window.confirm(`¿Seguro que desea ANULAR este egreso?`)) return;
        try {
            const result = await anularEgreso(item.id);
            if (result.success) {
                setFormSuccess('Egreso anulado');
                fetchEgresos();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    const openViewModal = (egreso) => {
        setViewEgreso(egreso);
        setViewModalOpen(true);
    };

    const openFotoModal = (egreso) => {
        if (egreso.foto) {
            const fotoApiUrl = `${CONFIG.API_BASE_URL}/diesel/egresos/${egreso.id}/foto`;
            setFotoUrl(fotoApiUrl);
            setFotoModalOpen(true);
        }
    };

    // Get badge variant for estado
    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return 'warning';
            case 'COMPLETADO': return 'success';
            case 'ANULADO': return 'error';
            default: return 'default';
        }
    };

    // Get tipo badge
    const getTipoBadge = (tipo) => {
        return tipo === 'INTERNO' ? 'info' : 'secondary';
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Egresos de Combustible"
                icon={<Upload size={22} />}
                actions={
                    <SecuredButton
                        securityId="egresos.crear"
                        securityDesc="Registrar nuevo egreso"
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={openCreate}
                    >
                        Nuevo Egreso
                    </SecuredButton>
                }
            />

            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="diesel-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}

            {error && <DSAlert variant="error">{error}</DSAlert>}

            {/* FILTROS */}
            <DSSection className="diesel-filters-section">
                <div className="diesel-filters">
                    <div className="diesel-filters__row">
                        {/* Tipo */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Tipo</label>
                            <select className="ds-field__control" value={filters.tipo} onChange={handleFilterChange('tipo')}>
                                <option value="">Todos</option>
                                <option value="INTERNO">Interno</option>
                                <option value="EXTERNO">Externo</option>
                            </select>
                        </div>

                        {/* Tanque */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Tanque</label>
                            <select className="ds-field__control" value={filters.d_tanque_id} onChange={handleFilterChange('d_tanque_id')}>
                                <option value="">Todos</option>
                                {tanques.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                        </div>

                        {/* Estado */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Estado</label>
                            <select className="ds-field__control" value={filters.estado} onChange={handleFilterChange('estado')}>
                                <option value="">Todos</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="COMPLETADO">Completado</option>
                                <option value="ANULADO">Anulado</option>
                            </select>
                        </div>

                        {/* Fecha Inicio */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Desde</label>
                            <input type="date" className="ds-field__control" value={filters.fecha_inicio} onChange={handleFilterChange('fecha_inicio')} />
                        </div>

                        {/* Fecha Fin */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Hasta</label>
                            <input type="date" className="ds-field__control" value={filters.fecha_fin} onChange={handleFilterChange('fecha_fin')} />
                        </div>
                    </div>

                    {/* Period shortcuts */}
                    <div className="diesel-filters__row diesel-filters__shortcuts">
                        <span className="diesel-filters__label">Período:</span>
                        <DSButton size="sm" variant="ghost" onClick={() => handlePeriodShortcut(1)}>1 mes</DSButton>
                        <DSButton size="sm" variant="ghost" onClick={() => handlePeriodShortcut(3)}>3 meses</DSButton>
                        <DSButton size="sm" variant="ghost" onClick={() => handlePeriodShortcut(6)}>6 meses</DSButton>
                        <DSButton size="sm" variant="secondary" onClick={resetFilters} icon={<Filter size={14} />}>Limpiar</DSButton>
                    </div>
                </div>
            </DSSection>

            {/* TABLA */}
            <DSSection
                actions={
                    <div className="ds-section__actions-row">
                        <DSRefreshButton onClick={fetchEgresos} loading={loading} />
                        <span className="diesel-panel__count">{egresos.length} registros</span>
                    </div>
                }
            >
                <div className="diesel-table-wrapper">
                    {loading ? <DSLoading /> : egresos.length === 0 ? (
                        <div className="diesel-empty">No hay egresos registrados para este período</div>
                    ) : (
                        <table className="diesel-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Tanque</th>
                                    <th>Máquina / Chofer</th>
                                    <th>Trabajo</th>
                                    <th>Litros</th>
                                    <th>Estado</th>
                                    <th>Foto</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {egresos.map(row => (
                                    <tr key={row.id}>
                                        <td>{row.fecha}</td>
                                        <td><DSBadge variant={getTipoBadge(row.tipo)}>{row.tipo}</DSBadge></td>
                                        <td>{row.tanque?.nombre || '-'}</td>
                                        <td>
                                            {row.tipo === 'INTERNO'
                                                ? (row.maquina?.codigo || '-')
                                                : (row.nombre_chofer || '-')
                                            }
                                        </td>
                                        <td>{row.trabajo?.nombre || '-'}</td>
                                        <td className="text-right">
                                            {row.litros ? parseFloat(row.litros).toFixed(2) : '-'}
                                        </td>
                                        <td><DSBadge variant={getEstadoBadge(row.estado)}>{row.estado}</DSBadge></td>
                                        <td>
                                            {row.foto ? (
                                                <DSButton
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={<Image size={16} />}
                                                    onClick={() => openFotoModal(row)}
                                                    title="Ver foto"
                                                />
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontSize: '11px' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <DSButton
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={<Eye size={16} />}
                                                    onClick={() => openViewModal(row)}
                                                    title="Ver detalle"
                                                />
                                                {row.estado === 'PENDIENTE' && (
                                                    <>
                                                        <SecuredButton
                                                            securityId="egresos.completar"
                                                            securityDesc="Completar egreso"
                                                            size="sm"
                                                            variant="ghost"
                                                            icon={<Check size={16} />}
                                                            onClick={() => openCompletarModal(row)}
                                                            title="Completar"
                                                        />
                                                        <SecuredButton
                                                            securityId="egresos.anular"
                                                            securityDesc="Anular egreso"
                                                            size="sm"
                                                            variant="ghost-danger"
                                                            icon={<X size={16} />}
                                                            onClick={() => handleAnular(row)}
                                                            title="Anular"
                                                        />
                                                    </>
                                                )}
                                                {row.estado === 'COMPLETADO' && (
                                                    <SecuredButton
                                                        securityId="egresos.anular"
                                                        securityDesc="Anular egreso"
                                                        size="sm"
                                                        variant="ghost-danger"
                                                        icon={<Trash2 size={16} />}
                                                        onClick={() => handleAnular(row)}
                                                        title="Anular"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DSSection>

            {/* CREATE MODAL - WIZARD */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={`Nuevo Egreso - Paso ${step} de 3`}
                size="md"
                footer={
                    <div className="diesel-modal-footer">
                        <div className="diesel-modal-footer__actions">
                            {step > 1 && (
                                <DSButton onClick={prevStep} disabled={saving}>Anterior</DSButton>
                            )}
                            <DSButton onClick={closeModal} disabled={saving}>Cancelar</DSButton>
                            {step < 3 ? (
                                <DSButton
                                    variant="primary"
                                    onClick={() => {
                                        const err = step === 1 ? validateStep1() : validateStep2();
                                        if (err) {
                                            setFormError(err);
                                        } else {
                                            setFormError(null);
                                            nextStep();
                                        }
                                    }}
                                >
                                    {step === 2 ? 'Confirmar con PIN' : 'Siguiente'}
                                </DSButton>
                            ) : (
                                <DSButton
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    loading={saving}
                                    icon={<Save size={16} />}
                                >
                                    Despachar
                                </DSButton>
                            )}
                        </div>
                    </div>
                }
            >
                {formError && <DSAlert variant="error" className="mb-4">{formError}</DSAlert>}

                {/* STEP 1: Tipo de egreso */}
                {step === 1 && (
                    <div className="egreso-step egreso-step--tipo">
                        <h3 className="egreso-step__title">¿A quién despachas?</h3>
                        <div className="egreso-tipo-cards">
                            <button
                                type="button"
                                className={`egreso-tipo-card ${form.tipo === 'INTERNO' ? 'egreso-tipo-card--selected' : ''}`}
                                onClick={() => setForm(prev => ({ ...prev, tipo: 'INTERNO' }))}
                            >
                                <Settings2 size={48} />
                                <span className="egreso-tipo-card__title">INTERNO</span>
                                <span className="egreso-tipo-card__desc">Maquinaria de la empresa</span>
                            </button>
                            <button
                                type="button"
                                className={`egreso-tipo-card ${form.tipo === 'EXTERNO' ? 'egreso-tipo-card--selected' : ''}`}
                                onClick={() => setForm(prev => ({ ...prev, tipo: 'EXTERNO' }))}
                            >
                                <Truck size={48} />
                                <span className="egreso-tipo-card__title">EXTERNO</span>
                                <span className="egreso-tipo-card__desc">Vehículos de terceros</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Datos del despacho */}
                {step === 2 && (
                    <div className="egreso-step">
                        <DSFieldsGrid columns={2} gap="md" className="mb-4">
                            <div className="col-span-1">
                                <label className="ds-field__label">Fecha *</label>
                                <input type="date" className="ds-field__control" value={form.fecha} onChange={handleChange('fecha')} />
                            </div>
                            <div className="col-span-1">
                                <div className="diesel-combo-header">
                                    <label className="ds-field__label">Tanque *</label>
                                    <button type="button" className="diesel-refresh-btn" onClick={refetchCombos} title="Actualizar">
                                        <RefreshCw size={12} />
                                    </button>
                                </div>
                                <select className="ds-field__control" value={form.d_tanque_id} onChange={handleChange('d_tanque_id')}>
                                    <option value="">Seleccione...</option>
                                    {tanques.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre} (Stock: {parseFloat(t.stock_actual).toFixed(2)} L)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {form.tipo === 'INTERNO' && (
                                <div className="col-span-2">
                                    <div className="diesel-combo-header">
                                        <label className="ds-field__label">Trabajo *</label>
                                    </div>
                                    <select className="ds-field__control" value={form.d_trabajo_id} onChange={handleChange('d_trabajo_id')}>
                                        <option value="">Seleccione...</option>
                                        {trabajos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>
                            )}

                            {form.tipo === 'INTERNO' ? (
                                <>
                                    <div className="col-span-2">
                                        <div className="diesel-combo-header">
                                            <label className="ds-field__label">Máquina *</label>
                                        </div>
                                        <select className="ds-field__control" value={form.d_maquina_id} onChange={handleChange('d_maquina_id')}>
                                            <option value="">Seleccione...</option>
                                            {maquinas.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.codigo} {m.division ? `(${m.division.nombre})` : ''} - Horómetro: {parseFloat(m.horometro_actual || 0).toFixed(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="col-span-1">
                                        <label className="ds-field__label">Nombre Chofer *</label>
                                        <input type="text" className="ds-field__control" value={form.nombre_chofer} onChange={handleChange('nombre_chofer')} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="ds-field__label">Placa Vehículo *</label>
                                        <input type="text" className="ds-field__control" value={form.placa_vehiculo} onChange={handleChange('placa_vehiculo')} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="ds-field__label">Carnet Chofer *</label>
                                        <input type="text" className="ds-field__control" value={form.carnet_chofer} onChange={handleChange('carnet_chofer')} />
                                    </div>
                                </>
                            )}

                            <div className="col-span-1">
                                <label className="ds-field__label">
                                    Lectura Inicial Del Tanque (L) *
                                    <span className="diesel-tooltip">
                                        <HelpCircle size={14} />
                                        <span className="diesel-tooltip__text">Nivel del tanque antes de iniciar el despacho</span>
                                    </span>
                                </label>
                                <input type="number" step="0.01" className="ds-field__control" value={form.inicio_tanque} onChange={handleChange('inicio_tanque')} />
                            </div>
                            <div className="col-span-1">
                                <label className="ds-field__label">Observaciones</label>
                                <input type="text" className="ds-field__control" value={form.observaciones} onChange={handleChange('observaciones')} />
                            </div>
                        </DSFieldsGrid>

                        {selectedTanque && (
                            <div className="egreso-tanque-info">
                                <strong>Stock Sistema:</strong> {parseFloat(selectedTanque.stock_actual).toFixed(2)} L
                                <span className="egreso-tanque-info__sep">|</span>
                                <strong>Capacidad:</strong> {parseFloat(selectedTanque.capacidad_maxima).toFixed(2)} L
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: Confirmar con PIN */}
                {step === 3 && (
                    <div className="egreso-step egreso-step--pin">
                        <h3 className="egreso-step__title">Confirmar Despacho</h3>
                        <div className="egreso-resumen">
                            <p><strong>Tipo:</strong> {form.tipo}</p>
                            <p><strong>Tanque:</strong> {selectedTanque?.nombre || '-'}</p>
                            {form.d_trabajo_id && (
                                <p><strong>Trabajo:</strong> {trabajos.find(t => t.id === parseInt(form.d_trabajo_id))?.nombre || '-'}</p>
                            )}
                            {form.tipo === 'INTERNO' && (
                                <>
                                    <p><strong>Máquina:</strong> {selectedMaquina?.codigo || '-'}</p>
                                    <p><strong>Horómetro Actual:</strong> {parseFloat(selectedMaquina?.horometro_actual || 0).toFixed(1)}</p>
                                </>
                            )}
                            {form.tipo === 'EXTERNO' && (
                                <>
                                    <p><strong>Chofer:</strong> {form.nombre_chofer}</p>
                                    <p><strong>Placa:</strong> {form.placa_vehiculo}</p>
                                </>
                            )}
                            <p><strong>Lectura Inicial:</strong> {form.inicio_tanque} L</p>
                        </div>
                        <div className="egreso-pin-field">
                            <label className="ds-field__label">Ingresa tu PIN de entrega *</label>
                            <input
                                type="password"
                                maxLength={4}
                                className="ds-field__control egreso-pin-input"
                                value={form.pin_entrega}
                                onChange={handleChange('pin_entrega')}
                                placeholder="****"
                                autoFocus
                            />
                            <span className="egreso-pin-hint">PIN de 4 dígitos del personal asignado al tanque</span>
                        </div>
                    </div>
                )}
            </DSModal>

            {/* COMPLETAR MODAL */}
            <DSModal
                isOpen={completarModalOpen}
                onClose={() => setCompletarModalOpen(false)}
                title="Completar Egreso"
                size="sm"
                footer={
                    <div className="diesel-modal-footer">
                        <div className="diesel-modal-footer__actions">
                            <DSButton onClick={() => setCompletarModalOpen(false)} disabled={saving}>Cancelar</DSButton>
                            <DSButton variant="primary" onClick={handleCompletar} disabled={saving} loading={saving} icon={<Check size={16} />}>
                                Completar
                            </DSButton>
                        </div>
                    </div>
                }
            >
                {formError && <DSAlert variant="error" className="mb-4">{formError}</DSAlert>}

                {completarEgresoData && (
                    <div className="egreso-completar">
                        <div className="egreso-completar__info">
                            <p><strong>Tanque:</strong> {completarEgresoData.tanque?.nombre}</p>
                            <p><strong>Lectura Inicial:</strong> {completarEgresoData.inicio_tanque} L</p>
                        </div>

                        <DSFieldsGrid columns={1} gap="md">
                            <div>
                                <label className="ds-field__label">Lectura Final del Tanque (L) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="ds-field__control"
                                    value={completarForm.fin_tanque}
                                    onChange={handleCompletarChange('fin_tanque')}
                                />
                            </div>
                            <div>
                                <label className="ds-field__label">Litros Despachados</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="ds-field__control"
                                    value={completarForm.litros}
                                    onChange={handleCompletarChange('litros')}
                                    style={{ fontWeight: 'bold', fontSize: '1.2em' }}
                                />
                            </div>
                            {completarEgresoData.tipo === 'INTERNO' && (
                                <>
                                    <div>
                                        <label className="ds-field__label">
                                            Horómetro Final *
                                            <span style={{ color: '#6b7280', fontWeight: 'normal', fontSize: '12px' }}>
                                                (Actual: {parseFloat(getCompletarMaquina(completarEgresoData)?.horometro_actual || 0).toFixed(1)})
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={parseFloat(getCompletarMaquina(completarEgresoData)?.horometro_actual || 0)}
                                            className="ds-field__control"
                                            value={completarForm.horometro_final}
                                            onChange={handleCompletarChange('horometro_final')}
                                            placeholder={`Mínimo: ${parseFloat(getCompletarMaquina(completarEgresoData)?.horometro_actual || 0).toFixed(1)}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="ds-field__label">PIN de Recibo *</label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            className="ds-field__control"
                                            value={completarForm.pin_recibo}
                                            onChange={handleCompletarChange('pin_recibo')}
                                            placeholder="****"
                                        />
                                    </div>
                                </>
                            )}
                        </DSFieldsGrid>

                        {/* Captura de foto */}
                        <div className="mt-4">
                            <PhotoCapture
                                onCapture={(blob) => setFotoEgreso(blob)}
                                value={fotoEgreso ? URL.createObjectURL(fotoEgreso) : null}
                                disabled={saving}
                                label={completarEgresoData.tipo === 'EXTERNO'
                                    ? 'Foto del Despacho *'
                                    : 'Foto del Despacho (opcional)'
                                }
                            />
                        </div>
                    </div>
                )}
            </DSModal>

            {/* VIEW MODAL */}
            <DSModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Detalle del Egreso"
                size="md"
            >
                {viewEgreso && (
                    <div className="diesel-view-info">
                        <p><strong>Fecha:</strong> {viewEgreso.fecha}</p>
                        <p><strong>Tipo:</strong> <DSBadge variant={getTipoBadge(viewEgreso.tipo)}>{viewEgreso.tipo}</DSBadge></p>
                        <p><strong>Estado:</strong> <DSBadge variant={getEstadoBadge(viewEgreso.estado)}>{viewEgreso.estado}</DSBadge></p>
                        <p><strong>Tanque:</strong> {viewEgreso.tanque?.nombre || '-'}</p>
                        {viewEgreso.trabajo && (
                            <p><strong>Trabajo:</strong> {viewEgreso.trabajo?.nombre}</p>
                        )}
                        {viewEgreso.tipo === 'INTERNO' && (
                            <>
                                <p><strong>Máquina:</strong> {viewEgreso.maquina?.codigo || '-'}</p>
                                <p><strong>Horómetro:</strong> {viewEgreso.horometro || '-'}</p>
                                <p><strong>Entrega:</strong> {viewEgreso.personal_entrega?.nombres || '-'}</p>
                                <p><strong>Recibe:</strong> {viewEgreso.personal_recibe?.nombres || '-'}</p>
                            </>
                        )}
                        {viewEgreso.tipo === 'EXTERNO' && (
                            <>
                                <p><strong>Chofer:</strong> {viewEgreso.nombre_chofer || '-'}</p>
                                <p><strong>Carnet:</strong> {viewEgreso.carnet_chofer || '-'}</p>
                                <p><strong>Placa:</strong> {viewEgreso.placa_vehiculo || '-'}</p>
                            </>
                        )}
                        <p><strong>Lectura Inicial:</strong> {viewEgreso.inicio_tanque || '-'} L</p>
                        <p><strong>Lectura Final:</strong> {viewEgreso.fin_tanque || '-'} L</p>
                        <p><strong>Litros:</strong> {viewEgreso.litros ? parseFloat(viewEgreso.litros).toFixed(2) : '-'} L</p>
                        {viewEgreso.observaciones && (
                            <p style={{ gridColumn: '1 / -1' }}><strong>Observaciones:</strong> {viewEgreso.observaciones}</p>
                        )}
                    </div>
                )}
            </DSModal>

            {/* FOTO MODAL */}
            <DSModal
                isOpen={fotoModalOpen}
                onClose={() => setFotoModalOpen(false)}
                title="Foto del Egreso"
                size="lg"
            >
                {fotoUrl && (
                    <div style={{ textAlign: 'center' }}>
                        <img src={fotoUrl} alt="Foto del egreso" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
                    </div>
                )}
            </DSModal>
        </DSPage>
    );
}

export default EgresosPage;
