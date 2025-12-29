import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { DSButton } from '../ds-forms';
import './DSEditableGrid.css';

/**
 * DSEditableGrid
 * Grid editable profesional con soporte responsivo.
 * - Escritorio: Tabla estándar
 * - Móvil: Tarjetas verticales
 */
export function DSEditableGrid({
    columns = [],
    data = [],
    onChange,
    onRemove,
    onAdd,
    canAdd = true,
    canRemove = true,
    emptyText = "No hay registros"
}) {

    const renderCell = (row, col) => {
        const value = row[col.field];

        if (col.render) {
            return col.render(row, onChange);
        }

        if (col.editable !== false) {
            if (col.type === 'select' && col.options) {
                return (
                    <select
                        className="ds-field__control ds-editable-grid__select"
                        value={value || ''}
                        onChange={(e) => onChange(row.id, col.field, e.target.value)}
                    >
                        <option value="">Seleccione...</option>
                        {col.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            }
            if (col.type === 'number') {
                return (
                    <input
                        type="number"
                        step={col.step || "0.01"}
                        className="ds-field__control ds-editable-grid__input ds-editable-grid__input--number"
                        value={value || ''}
                        onChange={(e) => onChange(row.id, col.field, e.target.value)}
                        placeholder="0.00"
                    />
                );
            }
            return (
                <input
                    type="text"
                    className="ds-field__control ds-editable-grid__input"
                    value={value || ''}
                    onChange={(e) => onChange(row.id, col.field, e.target.value)}
                />
            );
        }

        return <span className={col.className}>{value}</span>;
    };

    return (
        <div className="ds-editable-grid">
            {/* DESKTOP TABLE VIEW */}
            <div className="ds-editable-grid__table-wrapper">
                <table className="ds-editable-grid__table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={col.field || idx} style={{ width: col.width, textAlign: col.align || 'left' }}>
                                    {col.title}
                                </th>
                            ))}
                            {canRemove && <th className="ds-editable-grid__th-actions"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={row.id || idx}>
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} style={{ textAlign: col.align || 'left' }}>
                                        {renderCell(row, col)}
                                    </td>
                                ))}
                                {canRemove && (
                                    <td className="ds-editable-grid__td-actions">
                                        <button
                                            className="ds-editable-grid__delete-btn"
                                            onClick={() => onRemove(row.id)}
                                            title="Eliminar fila"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + (canRemove ? 1 : 0)} className="ds-editable-grid__empty">
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="ds-editable-grid__cards-wrapper">
                {data.map((row, idx) => (
                    <div key={row.id || idx} className="ds-editable-grid__card">
                        {canRemove && (
                            <button
                                className="ds-editable-grid__card-delete"
                                onClick={() => onRemove(row.id)}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <div className="ds-editable-grid__card-fields">
                            {columns.map((col, cIdx) => (
                                <div key={cIdx} className="ds-editable-grid__card-field">
                                    <label className="ds-editable-grid__card-label">{col.title}</label>
                                    <div className="ds-editable-grid__card-value">{renderCell(row, col)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="ds-editable-grid__empty ds-editable-grid__empty--card">
                        {emptyText}
                    </div>
                )}
            </div>

            {canAdd && (
                <div className="ds-editable-grid__footer">
                    <DSButton size="sm" variant="secondary" icon={<Plus size={14} />} onClick={onAdd}>
                        Agregar Fila
                    </DSButton>
                </div>
            )}
        </div>
    );
}
