import React, { useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DSModal } from './DSModal';
import { DSModalSection } from './DSModal';
import { DSAlert } from './DSAlert';
import { DSButton } from '../ds-forms/DSButton';
import './DSBulkImportModal.css';

/**
 * DSBulkImportModal - Modal reutilizable para ingreso masivo de registros
 * 
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Callback al cerrar el modal
 * @param {string} title - Título del modal
 * @param {Array} columns - Configuración de columnas
 *   @param {string} columns[].field - Nombre del campo
 *   @param {string} columns[].label - Etiqueta visible
 *   @param {boolean} columns[].required - Si el campo es requerido
 *   @param {string} columns[].type - Tipo: 'text' | 'number' | 'select'
 *   @param {Array} columns[].options - Opciones para select [{value, label}]
 *   @param {string} columns[].placeholder - Placeholder del input
 *   @param {string} columns[].width - Ancho CSS (flex o fixed)
 * @param {function} onSave - Callback async al guardar: (rows) => Promise<result>
 * @param {function} onSuccess - Callback al guardar exitosamente
 * @param {string} entityName - Nombre de la entidad (ej: "ubicación", "trabajo")
 * @param {object} initialRow - Valores iniciales para nuevas filas
 */
export function DSBulkImportModal({
    isOpen,
    onClose,
    title = 'Ingreso Masivo',
    columns = [],
    onSave,
    onSuccess,
    entityName = 'registro',
    initialRow = {},
    size = 'lg'
}) {
    // Crear fila inicial con todos los campos
    const createEmptyRow = useCallback(() => {
        const row = { id: Date.now() };
        columns.forEach(col => {
            row[col.field] = initialRow[col.field] ?? '';
        });
        return row;
    }, [columns, initialRow]);

    const [rows, setRows] = useState([createEmptyRow()]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Reset al abrir/cerrar
    const handleClose = () => {
        setRows([createEmptyRow()]);
        setError(null);
        onClose();
    };

    // Agregar fila
    const addRow = () => {
        setRows(prev => [...prev, createEmptyRow()]);
    };

    // Eliminar fila
    const removeRow = (id) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter(r => r.id !== id));
    };

    // Cambiar valor
    const handleChange = (id, field, value) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    // Validar
    const validate = () => {
        for (let i = 0; i < rows.length; i++) {
            for (const col of columns) {
                if (col.required) {
                    const value = rows[i][col.field];
                    if (value === undefined || value === null || value === '' ||
                        (typeof value === 'string' && !value.trim())) {
                        return `Fila ${i + 1}: ${col.label} es requerido`;
                    }
                }
            }
        }
        return null;
    };

    // Guardar
    const handleSave = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // Remover id interno antes de enviar
            const cleanRows = rows.map(r => {
                const { id, ...rest } = r;
                const cleaned = {};
                // Solo incluir campos con valor
                Object.keys(rest).forEach(key => {
                    const value = rest[key];
                    if (value !== null && value !== undefined && value !== '') {
                        // Trim strings
                        cleaned[key] = typeof value === 'string' ? value.trim() : value;
                    }
                });
                return cleaned;
            });

            const result = await onSave(cleanRows);

            if (result.success) {
                let msg = result.message;
                if (result.errores && result.errores.length > 0) {
                    msg += `. ${result.errores.length} registro(s) con errores.`;
                }
                handleClose();
                if (onSuccess) {
                    onSuccess(result, msg);
                }
            } else {
                let errorMsg = result.message || 'Error al guardar';
                if (result.errores && result.errores.length > 0) {
                    errorMsg += ': ' + result.errores.map(e => `${e.nombre || e.field || 'Error'} (${e.error})`).join(', ');
                }
                setError(errorMsg);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    // Renderizar input según tipo
    const renderInput = (row, col, index) => {
        const value = row[col.field] ?? '';

        if (col.type === 'select') {
            return (
                <select
                    className="ds-field__control"
                    value={value}
                    onChange={(e) => handleChange(row.id, col.field, e.target.value)}
                >
                    <option value="">{col.placeholder || '-- Seleccionar --'}</option>
                    {(col.options || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        }

        if (col.type === 'textarea') {
            return (
                <textarea
                    className="ds-field__control"
                    value={value}
                    onChange={(e) => handleChange(row.id, col.field, e.target.value)}
                    placeholder={col.placeholder || ''}
                    rows={1}
                    style={{ resize: 'vertical', minHeight: '38px' }}
                />
            );
        }

        if (col.type === 'number') {
            return (
                <input
                    type="number"
                    className="ds-field__control"
                    value={value}
                    onChange={(e) => handleChange(row.id, col.field, e.target.value)}
                    placeholder={col.placeholder || ''}
                    step={col.step || 'any'}
                    min={col.min}
                    max={col.max}
                />
            );
        }

        // Default: text
        return (
            <input
                type="text"
                className="ds-field__control"
                value={value}
                onChange={(e) => handleChange(row.id, col.field, e.target.value)}
                placeholder={col.placeholder || `${col.label} ${index + 1}`}
            />
        );
    };

    // Calcular estilos de columna
    const getColumnStyle = (col) => {
        if (col.fullRow) {
            return {
                width: '100%',
                flex: 'none',
                order: 10, // Al final (Nueva fila)
                paddingTop: '12px',
                marginTop: '4px',
                borderTop: '1px dashed var(--ds-fieldBorder, #e5e7eb)',
                display: 'block'
            };
        }
        if (col.width) {
            if (col.width.includes('px') || col.width.includes('%')) {
                return { width: col.width, flex: 'none' };
            }
            return { flex: col.width };
        }
        return { flex: 1 };
    };

    const hasFullRow = columns.some(c => c.fullRow);
    const rowStyle = hasFullRow ? { flexWrap: 'wrap' } : {};
    // Estilo para la columna de acciones
    const actionsStyle = hasFullRow ? { marginLeft: 'auto' } : {};

    return (
        <DSModal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size={size}
            footer={
                <div className="ds-bulk-modal__footer">
                    <div className="ds-bulk-modal__info">
                        <span>{rows.length} {entityName}(s) a crear</span>
                    </div>
                    <div className="ds-bulk-modal__actions">
                        <DSButton onClick={handleClose} disabled={saving}>Cancelar</DSButton>
                        <DSButton variant="primary" onClick={handleSave} disabled={saving} loading={saving}>
                            {saving ? 'Guardando...' : 'Guardar Todo'}
                        </DSButton>
                    </div>
                </div>
            }
        >
            {error && (
                <DSAlert variant="error" dismissible onDismiss={() => setError(null)} className="ds-bulk-modal__alert">
                    {error}
                </DSAlert>
            )}

            <DSModalSection title={`Lista de ${entityName}s`}>
                <div className="ds-bulk-grid">
                    {/* Header: Solo columnas normales */}
                    <div className="ds-bulk-grid__header" style={rowStyle}>
                        {columns.filter(c => !c.fullRow).map(col => (
                            <div
                                key={col.field}
                                className="ds-bulk-grid__col"
                                style={getColumnStyle(col)}
                            >
                                {col.label} {col.required && '*'}
                            </div>
                        ))}
                        <div className="ds-bulk-grid__col ds-bulk-grid__col--actions" style={actionsStyle}></div>
                    </div>

                    {/* Rows */}
                    {rows.map((row, index) => (
                        <div key={row.id} className="ds-bulk-grid__row" style={rowStyle}>
                            {columns.map(col => (
                                <div
                                    key={col.field}
                                    className="ds-bulk-grid__col"
                                    style={getColumnStyle(col)}
                                >
                                    {col.fullRow && (
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ds-secondaryText)', marginBottom: '4px' }}>
                                            {col.label} {col.required && '*'}
                                        </div>
                                    )}
                                    {renderInput(row, col, index)}
                                </div>
                            ))}
                            <div className="ds-bulk-grid__col ds-bulk-grid__col--actions" style={actionsStyle}>
                                <DSButton
                                    size="sm"
                                    variant="ghost-danger"
                                    iconOnly
                                    icon={<Trash2 size={16} />}
                                    onClick={() => removeRow(row.id)}
                                    disabled={rows.length <= 1}
                                    title="Eliminar fila"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add button */}
                <div className="ds-bulk-grid__add">
                    <DSButton size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addRow}>
                        Agregar Fila
                    </DSButton>
                </div>
            </DSModalSection>
        </DSModal>
    );
}

export default DSBulkImportModal;
