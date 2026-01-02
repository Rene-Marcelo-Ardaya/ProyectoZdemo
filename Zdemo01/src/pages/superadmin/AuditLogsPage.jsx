import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    Clock,
    Plus,
    Edit,
    Trash2,
    FileText,
    User,
    Calendar,
    Shield,
    Eye
} from 'lucide-react';
import {
    DSPageHeader,
    DSButton,
    DSLoading,
    DSEmpty,
} from '../../ds-components';
import { getAuditLogs, getAuditStats } from '../../services/tenantService';
import './AuditLogsPage.css';

/**
 * AuditLogsPage - Logs de Auditoría del Super Admin
 */
const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    // Filtros
    const [filters, setFilters] = useState({
        action: '',
        entity_type: '',
        from: '',
        to: '',
    });

    // Paginación
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, last_page: 1 });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = { ...filters, page, per_page: 25 };
            // Limpiar params vacíos
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const [logsRes, statsRes] = await Promise.all([
                getAuditLogs(params),
                page === 1 ? getAuditStats() : Promise.resolve(null)
            ]);

            if (logsRes.success) {
                setLogs(logsRes.data || []);
                if (logsRes.meta) {
                    setMeta(logsRes.meta);
                }
            }

            if (statsRes?.success) {
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error('Error loading audit logs:', err);
            setError('Error al cargar los logs');
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1); // Reset a primera página
    };

    const clearFilters = () => {
        setFilters({ action: '', entity_type: '', from: '', to: '' });
        setPage(1);
    };

    const toggleRowExpand = (logId) => {
        setExpandedRow(expandedRow === logId ? null : logId);
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'create': return <Plus size={14} />;
            case 'update': return <Edit size={14} />;
            case 'delete': return <Trash2 size={14} />;
            default: return <FileText size={14} />;
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'create': return 'Creación';
            case 'update': return 'Actualización';
            case 'delete': return 'Eliminación';
            default: return action;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderChanges = (oldValues, newValues) => {
        if (!oldValues && !newValues) return <span className="audit-no-changes">Sin datos</span>;

        const changes = [];
        const allKeys = new Set([
            ...Object.keys(oldValues || {}),
            ...Object.keys(newValues || {})
        ]);

        // Ignorar campos técnicos
        const ignoredKeys = ['created_at', 'updated_at', 'id', 'password', 'remember_token'];

        allKeys.forEach(key => {
            if (ignoredKeys.includes(key)) return;

            const oldVal = oldValues?.[key];
            const newVal = newValues?.[key];

            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                changes.push({ key, oldVal, newVal });
            }
        });

        if (changes.length === 0) {
            return <span className="audit-no-changes">Sin cambios detectados</span>;
        }

        return (
            <div className="audit-changes">
                {changes.map(({ key, oldVal, newVal }) => (
                    <div key={key} className="audit-change-row">
                        <span className="audit-change-key">{key}</span>
                        {oldVal !== undefined && (
                            <span className="audit-change-old">
                                {typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal ?? '-')}
                            </span>
                        )}
                        <span className="audit-change-arrow">→</span>
                        {newVal !== undefined && (
                            <span className="audit-change-new">
                                {typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal ?? '-')}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (loading && logs.length === 0) {
        return <DSLoading text="Cargando logs de auditoría..." />;
    }

    return (
        <div className="audit-page">
            <DSPageHeader
                title="Logs de Auditoría"
                subtitle="Registro de todas las operaciones realizadas en el panel"
            />

            {/* Stats */}
            {stats && (
                <div className="audit-summary">
                    <div className="audit-summary__item">
                        <div className="audit-summary__icon audit-summary__icon--blue">
                            <FileText size={18} />
                        </div>
                        <div className="audit-summary__text">
                            <span className="audit-summary__value">{stats.total}</span>
                            <span className="audit-summary__label">Total Logs</span>
                        </div>
                    </div>
                    <div className="audit-summary__item">
                        <div className="audit-summary__icon audit-summary__icon--green">
                            <Plus size={18} />
                        </div>
                        <div className="audit-summary__text">
                            <span className="audit-summary__value">{stats.by_action?.create || 0}</span>
                            <span className="audit-summary__label">Creaciones</span>
                        </div>
                    </div>
                    <div className="audit-summary__item">
                        <div className="audit-summary__icon audit-summary__icon--yellow">
                            <Edit size={18} />
                        </div>
                        <div className="audit-summary__text">
                            <span className="audit-summary__value">{stats.by_action?.update || 0}</span>
                            <span className="audit-summary__label">Actualizaciones</span>
                        </div>
                    </div>
                    <div className="audit-summary__item">
                        <div className="audit-summary__icon audit-summary__icon--red">
                            <Trash2 size={18} />
                        </div>
                        <div className="audit-summary__text">
                            <span className="audit-summary__value">{stats.by_action?.delete || 0}</span>
                            <span className="audit-summary__label">Eliminaciones</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="tenants-error">
                    <p>{error}</p>
                    <button onClick={loadData}>Reintentar</button>
                </div>
            )}

            {/* Filters */}
            <div className="audit-filters">
                <div className="audit-filters__row">
                    <div className="audit-filter">
                        <label>Acción</label>
                        <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                        >
                            <option value="">Todas</option>
                            <option value="create">Creación</option>
                            <option value="update">Actualización</option>
                            <option value="delete">Eliminación</option>
                        </select>
                    </div>
                    <div className="audit-filter">
                        <label>Entidad</label>
                        <select
                            value={filters.entity_type}
                            onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                        >
                            <option value="">Todas</option>
                            <option value="Tenant">Tenants</option>
                            <option value="Plan">Planes</option>
                            <option value="Module">Módulos</option>
                        </select>
                    </div>
                    <div className="audit-filter">
                        <label>Desde</label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => handleFilterChange('from', e.target.value)}
                        />
                    </div>
                    <div className="audit-filter">
                        <label>Hasta</label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => handleFilterChange('to', e.target.value)}
                        />
                    </div>
                    <div className="audit-filter__actions">
                        <DSButton
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                        >
                            Limpiar
                        </DSButton>
                        <DSButton
                            icon={<RefreshCw size={14} className={loading ? 'spin-animation' : ''} />}
                            variant="ghost"
                            size="sm"
                            onClick={loadData}
                            disabled={loading}
                        >
                            Actualizar
                        </DSButton>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="audit-table-container">
                <table className="data-table audit-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Fecha</th>
                            <th>Acción</th>
                            <th>Entidad</th>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <React.Fragment key={log.id}>
                                <tr
                                    className={`audit-row ${expandedRow === log.id ? 'audit-row--expanded' : ''}`}
                                    onClick={() => toggleRowExpand(log.id)}
                                >
                                    <td>
                                        {expandedRow === log.id ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </td>
                                    <td>
                                        <div className="audit-cell-date">
                                            <Clock size={12} />
                                            {formatDate(log.created_at)}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`audit-action audit-action--${log.action}`}>
                                            {getActionIcon(log.action)}
                                            {getActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="audit-entity">{log.entity_type}</span>
                                    </td>
                                    <td>
                                        <code className="audit-id">#{log.entity_id}</code>
                                    </td>
                                    <td>
                                        <div className="audit-user">
                                            <User size={12} />
                                            {log.user?.name || 'Sistema'}
                                        </div>
                                    </td>
                                    <td>
                                        <code className="audit-ip">{log.ip_address || '-'}</code>
                                    </td>
                                </tr>
                                {expandedRow === log.id && (
                                    <tr className="audit-detail-row">
                                        <td colSpan={7}>
                                            <div className="audit-detail">
                                                <div className="audit-detail__header">
                                                    <Eye size={14} />
                                                    <span>Detalles del cambio</span>
                                                </div>
                                                {renderChanges(log.old_values, log.new_values)}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {logs.length === 0 && !loading && (
                    <DSEmpty
                        title="No hay logs"
                        description="No se encontraron registros con los filtros seleccionados"
                    />
                )}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="audit-pagination">
                    <span className="audit-pagination__info">
                        Página {meta.current_page} de {meta.last_page} ({meta.total} registros)
                    </span>
                    <div className="audit-pagination__buttons">
                        <DSButton
                            variant="ghost"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Anterior
                        </DSButton>
                        <DSButton
                            variant="ghost"
                            size="sm"
                            disabled={page >= meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Siguiente
                        </DSButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogsPage;
