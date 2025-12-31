import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Truck, CheckCircle, Eye, RefreshCw, HelpCircle, Save, AlertTriangle } from 'lucide-react';
import {
    getIngresos,
    getIngreso,
    recepcionarIngreso,
    getTanques
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
    DSEditableGrid,
    SecuredButton,
} from '../../ds-components';

import { PhotoCapture } from '../../components/PhotoCapture';
import './DieselPages.css';

export function RecepcionPage() {
    // Data state
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIngreso, setSelectedIngreso] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // Modal de ajuste
    const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
    const [tanqueConDiferencia, setTanqueConDiferencia] = useState(null);
    const [formAjuste, setFormAjuste] = useState({
        ajuste_tanque: '',
        motivo: '',
        nota: '',
        pin: ''
    });

    // Tanques data
    const [tanques, setTanques] = useState([]);

    // Estado para foto de recepción
    const [fotoRecepcion, setFotoRecepcion] = useState(null);

    // Cargar tanques
    useEffect(() => {
        const fetchTanques = async () => {
            try {
                const result = await getTanques(true);
                setTanques(result.data || []);
            } catch (err) {
                console.error('Error cargando tanques:', err);
            }
        };
        fetchTanques();
    }, []);

    // Form state para recepción
    const [form, setForm] = useState({
        nombre_chofer: '',
        placa_vehiculo: '',
        detalles: [] // { id, d_tanque_id, tanque_nombre, litros, inicio_sistema, final_sistema, inicio_digital, final_digital, stock_actual }
    });

    // Fetch ingresos (pendientes primero por backend)
    const fetchIngresos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Sin filtro de estado para traer todo (el backend ordena)
            const result = await getIngresos({});
            // Filtrar items que ya fueron recepcionados offline (estado cambió a FINALIZADO localmente)
            const data = (result.data || []).map(item => ({
                ...item,
                _isPending: item.estado === 'PENDIENTE'
            }));

            setIngresos(data);
        } catch (err) {
            setError('Error cargando ingresos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIngresos();
    }, [fetchIngresos]);

    // Abrir modal para recepcionar
    const openRecepcionar = async (ingreso) => {
        try {
            // Cargar detalle completo del ingreso
            const result = await getIngreso(ingreso.id);
            if (result.success) {
                const data = result.data;
                setSelectedIngreso(data);

                // Los valores del sistema ya vienen calculados del backend
                const detallesConSistema = (data.detalles || []).map(det => {
                    return {
                        id: det.id,
                        d_tanque_id: det.d_tanque_id,
                        tanque_nombre: det.tanque?.nombre || '-',
                        litros: parseFloat(det.litros || 0),
                        // Valores del SISTEMA (ya calculados en el backend al crear el ingreso)
                        inicio_sistema: parseFloat(det.inicio_tanque || 0),
                        final_sistema: parseFloat(det.final_tanque || 0),
                        // Valores DIGITALES (vacíos, para que el usuario los ingrese)
                        inicio_digital: '',
                        final_digital: ''
                    };
                });

                setForm({
                    nombre_chofer: data.nombre_chofer || '',
                    placa_vehiculo: data.placa_vehiculo || '',
                    detalles: detallesConSistema
                });
                setModalOpen(true);
                setFormError(null);
            }
        } catch (err) {
            alert('Error cargando detalle del ingreso');
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedIngreso(null);
    };

    const getTanqueInfo = (tanqueId) => {
        return tanques.find(t => t.id === parseInt(tanqueId)) || null;
    };

    // Columnas para el grid de recepción
    const detalleColumns = [
        {
            field: 'tanque_nombre',
            title: 'Tanque',
            width: '20%',
            editable: false,
            render: (row) => <strong>{row.tanque_nombre}</strong>
        },
        {
            title: 'Stock Sistema',
            width: '15%',
            editable: false,
            render: (row) => {
                const info = getTanqueInfo(row.d_tanque_id);
                return info ? `${parseFloat(info.stock_actual).toFixed(2)} L` : '-';
            }
        },
        {
            title: 'Stock Final',
            width: '15%',
            editable: false,
            render: (row) => {
                const info = getTanqueInfo(row.d_tanque_id);
                if (!info) return '-';
                const stockActual = parseFloat(info.stock_actual);
                const litrosEsperados = parseFloat(row.litros) || 0;
                return `${(stockActual + litrosEsperados).toFixed(2)} L`;
            }
        },
        {
            field: 'inicio_digital',
            title: 'Inicio Digital *',
            width: '18%',
            type: 'number',
        },
        {
            field: 'final_digital',
            title: 'Final Digital *',
            width: '18%',
            type: 'number',
        },
        {
            title: 'Diferencia',
            width: '14%',
            editable: false,
            render: (row) => {
                const litrosEsperados = parseFloat(row.litros) || 0;
                const inicioDigital = parseFloat(row.inicio_digital) || 0;
                const finalDigital = parseFloat(row.final_digital) || 0;
                const litrosRecibidos = finalDigital - inicioDigital;
                const diferencia = litrosRecibidos - litrosEsperados;

                if (!row.inicio_digital || !row.final_digital) return '-';

                const color = Math.abs(diferencia) < 0.5 ? '#16a34a' : '#dc2626';
                return (
                    <strong style={{ color }}>
                        {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)} L
                    </strong>
                );
            }
        }
    ];

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleDetalleChange = (detalleId, field, value) => {
        setForm(prev => ({
            ...prev,
            detalles: prev.detalles.map(d =>
                d.id === detalleId ? { ...d, [field]: value } : d
            )
        }));
    };

    // Validación
    const validate = () => {
        for (const det of form.detalles) {
            if (det.inicio_digital === '' || det.inicio_digital === null) {
                return `Ingrese el inicio digital del tanque para ${det.tanque_nombre}`;
            }
            if (det.final_digital === '' || det.final_digital === null) {
                return `Ingrese el final digital del tanque para ${det.tanque_nombre}`;
            }
            if (parseFloat(det.final_digital) < parseFloat(det.inicio_digital)) {
                return `El final debe ser mayor o igual al inicio para ${det.tanque_nombre}`;
            }
        }
        return null;
    };

    // Verificar si hay diferencias entre lo recibido y lo esperado
    const verificarDiferencias = () => {
        for (const det of form.detalles) {
            const litrosRecibidos = parseFloat(det.final_digital) - parseFloat(det.inicio_digital);
            const litrosEsperados = det.litros; // Los litros que se registraron en el ingreso

            // Si la diferencia es mayor a 0.5 litros
            if (Math.abs(litrosRecibidos - litrosEsperados) > 0.5) {
                return det;
            }
        }
        return null;
    };

    const handleSubmit = async () => {
        const errorMsg = validate();
        if (errorMsg) {
            setFormError(errorMsg);
            return;
        }

        // Verificar si hay diferencias
        const detalleDiferente = verificarDiferencias();
        if (detalleDiferente) {
            // Abrir modal de ajuste
            setTanqueConDiferencia(detalleDiferente);
            setFormAjuste({
                ajuste_tanque: '',
                motivo: '',
                nota: '',
                pin: ''
            });
            setModalAjusteOpen(true);
            return;
        }

        // Si no hay diferencias, proceder con la recepción
        await procesarRecepcion();
    };

    const procesarRecepcion = async () => {
        setSaving(true);
        setFormError(null);

        try {
            const payload = {
                nombre_chofer: form.nombre_chofer,
                placa_vehiculo: form.placa_vehiculo,
                detalles: form.detalles.map(d => ({
                    id: d.id,
                    inicio_tanque: parseFloat(d.inicio_digital),
                    final_tanque: parseFloat(d.final_digital)
                }))
            };

            // Enviar con foto si existe
            const result = await recepcionarIngreso(selectedIngreso.id, payload, fotoRecepcion);

            if (result.success) {
                setFormSuccess('Ingreso recepcionado correctamente');
                setFotoRecepcion(null); // Limpiar foto
                closeModal();
                fetchIngresos();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                setFormError(result.message || 'Error al recepcionar');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmarAjuste = async () => {
        // Validar campos de ajuste
        if (!formAjuste.ajuste_tanque) {
            alert('Ingrese el ajuste del tanque');
            return;
        }
        if (!formAjuste.motivo) {
            alert('Seleccione el motivo del ajuste');
            return;
        }
        if (!formAjuste.pin) {
            alert('Ingrese el PIN de validación');
            return;
        }

        // TODO: Aquí validarías el PIN con el backend
        // Por ahora solo cerramos el modal y procesamos
        setModalAjusteOpen(false);
        await procesarRecepcion();
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Recepción de Combustible"
                icon={<Truck size={22} />}
                actions={
                    <DSButton
                        variant="secondary"
                        icon={<RefreshCw size={16} />}
                        onClick={fetchIngresos}
                    >
                        Actualizar
                    </DSButton>
                }
            />

            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="diesel-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}

            {error && <DSAlert variant="error">{error}</DSAlert>}

            <DSSection>
                <div className="diesel-table-wrapper">
                    {loading ? <DSLoading /> : ingresos.length === 0 ? (
                        <div className="diesel-empty">
                            <CheckCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No hay ingresos registrados</p>
                        </div>
                    ) : (
                        <table className="diesel-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Proveedor</th>
                                    <th>Total Litros</th>
                                    <th>Tanques</th>
                                    <th>Observaciones</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ingresos.map(row => {
                                    const isPending = row.estado === 'PENDIENTE';
                                    return (
                                        <tr key={row.id} className={!isPending ? 'diesel-row-finished' : ''}>
                                            <td>{row.fecha}</td>
                                            <td>{row.proveedor?.nombre || row.proveedor?.razon_social || '-'}</td>
                                            <td className="text-right">{parseFloat(row.total_litros).toFixed(2)}</td>
                                            <td>
                                                {(row.detalles || []).map((d, i) => (
                                                    <span key={i}>
                                                        {d.tanque?.nombre}
                                                        {i < row.detalles.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </td>
                                            <td>
                                                {row._offlinePending ? (
                                                    <span style={{ color: '#6366f1' }}>☁️ Creado offline</span>
                                                ) : (
                                                    row.observaciones || '-'
                                                )}
                                            </td>
                                            <td>
                                                <DSBadge variant={isPending ? 'warning' : 'success'}>
                                                    {isPending ? 'Pendiente' : 'Finalizado'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                {isPending && (
                                                    <SecuredButton
                                                        securityId="recepcion.procesar"
                                                        securityDesc="Procesar Recepción de Combustible"
                                                        size="sm"
                                                        variant="primary"
                                                        icon={<Truck size={16} />}
                                                        onClick={() => openRecepcionar(row)}
                                                    >
                                                        Recepcionar
                                                    </SecuredButton>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </DSSection>

            {/* MODAL RECEPCIÓN */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={`Recepcionar Compra #${selectedIngreso?.numero_factura_dia || ''}`}
                size="xl"
                footer={
                    <div className="diesel-modal-footer">
                        <div className="diesel-modal-footer__actions">
                            <DSButton onClick={closeModal} disabled={saving}>Cancelar</DSButton>
                            <DSButton
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={saving || !form.detalles.every(d => d.inicio_digital && d.final_digital)}
                                loading={saving}
                                icon={<Save size={16} />}
                            >
                                Confirmar Recepción
                                <span className="diesel-tooltip">
                                    <HelpCircle size={14} style={{ marginLeft: '6px' }} />
                                    <span className="diesel-tooltip__text">Ingrese la lectura del medidor digital del tanque antes y después de la recepción</span>
                                </span>
                            </DSButton>
                        </div>
                    </div>
                }
            >
                {formError && <DSAlert variant="error" className="mb-4">{formError}</DSAlert>}

                {selectedIngreso && (
                    <>
                        {/* Info del ingreso */}
                        <div className="diesel-view-info mb-4">
                            <p><strong>Fecha:</strong> {selectedIngreso.fecha}</p>
                            <p><strong>Proveedor:</strong> {selectedIngreso.proveedor?.nombre}</p>
                            <p><strong>Total Litros:</strong> {parseFloat(selectedIngreso.total_litros).toFixed(2)}</p>
                        </div>

                        {/* Datos del vehículo */}
                        <DSFieldsGrid columns={2} gap="md" className="mb-4">
                            <div>
                                <label className="ds-field__label">
                                    Chofer
                                    <span className="diesel-tooltip">
                                        <HelpCircle size={14} />
                                        <span className="diesel-tooltip__text">Nombre del conductor que trajo el combustible</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.nombre_chofer}
                                    onChange={handleChange('nombre_chofer')}
                                />
                            </div>
                            <div>
                                <label className="ds-field__label">
                                    Placa Vehículo
                                    <span className="diesel-tooltip">
                                        <HelpCircle size={14} />
                                        <span className="diesel-tooltip__text">Placa del vehículo cisterna</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.placa_vehiculo}
                                    onChange={handleChange('placa_vehiculo')}
                                />
                            </div>
                        </DSFieldsGrid>

                        {/* Captura de foto */}
                        <div className="mb-4">
                            <PhotoCapture
                                onCapture={(blob) => setFotoRecepcion(blob)}
                                value={fotoRecepcion ? URL.createObjectURL(fotoRecepcion) : null}
                                disabled={saving}
                                label="Foto del Camión/Chofer (opcional)"
                            />
                        </div>

                        {/* Grid de detalles por tanque */}
                        <div className="diesel-combo-header diesel-combo-header--section">
                            <span className="diesel-section-title">Registro por Tanque</span>
                        </div>
                        <DSEditableGrid
                            columns={detalleColumns}
                            data={form.detalles}
                            onChange={handleDetalleChange}
                            canRemove={false}
                            emptyText="No hay tanques para recepcionar"
                        />
                    </>
                )}
            </DSModal>

            {/* MODAL DE AJUSTE */}
            <DSModal
                isOpen={modalAjusteOpen}
                onClose={() => setModalAjusteOpen(false)}
                title="Ajuste de Diferencia Detectada"
                size="md"
                footer={
                    <div className="diesel-modal-footer">
                        <div className="diesel-modal-footer__actions">
                            <DSButton onClick={() => setModalAjusteOpen(false)} disabled={saving}>Cancelar</DSButton>
                            <DSButton
                                variant="primary"
                                onClick={handleConfirmarAjuste}
                                disabled={saving}
                                loading={saving}
                                icon={<Save size={16} />}
                            >
                                Confirmar Ajuste
                            </DSButton>
                        </div>
                    </div>
                }
            >
                {tanqueConDiferencia && (
                    <>
                        <DSAlert variant="warning" className="mb-4">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={20} />
                                <span>Se detectó una diferencia entre el sistema y la lectura digital</span>
                            </div>
                        </DSAlert>

                        {/* Información del tanque */}
                        <div className="diesel-view-info mb-4" style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px' }}>
                            <p><strong>Tanque:</strong> {tanqueConDiferencia.tanque_nombre}</p>
                            <p><strong>Litros Esperados:</strong> {parseFloat(tanqueConDiferencia.litros).toFixed(2)} L</p>
                            <p><strong>Litros Recibidos:</strong> {(parseFloat(tanqueConDiferencia.final_digital) - parseFloat(tanqueConDiferencia.inicio_digital)).toFixed(2)} L</p>
                            <p><strong>Diferencia:</strong> {Math.abs((parseFloat(tanqueConDiferencia.final_digital) - parseFloat(tanqueConDiferencia.inicio_digital)) - parseFloat(tanqueConDiferencia.litros)).toFixed(2)} L</p>
                        </div>

                        {/* Formulario de ajuste */}
                        <DSFieldsGrid columns={1} gap="md">
                            <div>
                                <label className="ds-field__label">
                                    Ajuste del Tanque (Litros) *
                                    <span className="diesel-tooltip">
                                        <HelpCircle size={14} />
                                        <span className="diesel-tooltip__text">Cantidad de litros a ajustar</span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="ds-field__control"
                                    value={formAjuste.ajuste_tanque}
                                    onChange={(e) => setFormAjuste(prev => ({ ...prev, ajuste_tanque: e.target.value }))}
                                    placeholder="Ej: 10.50"
                                />
                            </div>

                            <div>
                                <label className="ds-field__label">
                                    Motivo del Ajuste *
                                </label>
                                <select
                                    className="ds-field__control"
                                    value={formAjuste.motivo}
                                    onChange={(e) => setFormAjuste(prev => ({ ...prev, motivo: e.target.value }))}
                                >
                                    <option value="">Seleccione un motivo</option>
                                    <option value="error_medicion">Error de Medición</option>
                                    <option value="evaporacion">Evaporación</option>
                                    <option value="fuga">Fuga Detectada</option>
                                    <option value="calibracion">Calibración de Medidor</option>
                                    <option value="diferencia_proveedor">Diferencia con Proveedor</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="ds-field__label">
                                    Nota / Observación
                                </label>
                                <textarea
                                    className="ds-field__control"
                                    value={formAjuste.nota}
                                    onChange={(e) => setFormAjuste(prev => ({ ...prev, nota: e.target.value }))}
                                    rows="3"
                                    placeholder="Describa el motivo del ajuste..."
                                />
                            </div>

                            <div>
                                <label className="ds-field__label">
                                    PIN de Validación *
                                    <span className="diesel-tooltip">
                                        <HelpCircle size={14} />
                                        <span className="diesel-tooltip__text">Ingrese su PIN para autorizar el ajuste</span>
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    className="ds-field__control"
                                    value={formAjuste.pin}
                                    onChange={(e) => setFormAjuste(prev => ({ ...prev, pin: e.target.value }))}
                                    placeholder="••••"
                                    maxLength="6"
                                />
                            </div>
                        </DSFieldsGrid>
                    </>
                )}
            </DSModal>
        </DSPage>
    );
}

export default RecepcionPage;
