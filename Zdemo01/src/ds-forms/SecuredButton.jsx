/**
 * SecuredButton - Botón con control de seguridad por niveles
 * 
 * Este componente envuelve a DSButton y verifica si el usuario tiene
 * el nivel de seguridad necesario para ver/usar el botón.
 * 
 * El SuperAdmin puede además configurar el nivel requerido en tiempo real.
 */

import React, { useState, useMemo } from 'react';
import { Settings, Shield, Check, X, Unlock, Search } from 'lucide-react';
import { useSecurity } from '../core/SecurityContext';
import { setComponenteSecurity, removeComponenteSecurity } from '../services/securityLevelService';
import { DSButton } from './DSButton';
import { DSModal, DSModalSection } from '../ds-overlays';
import './SecuredButton.css';

/**
 * SecuredButton
 * 
 * @param {string} securityId - ID único del botón para seguridad (ej: "usuarios.crear")
 * @param {string} securityPage - Página donde está el botón (default: pathname actual)
 * @param {string} securityDesc - Descripción del botón (para admin)
 * @param {boolean} showConfigButton - Mostrar botón de configuración para admin (default: true)
 * @param {React.ReactNode} children - Contenido del botón
 * @param {...props} buttonProps - Props adicionales para DSButton
 */
export function SecuredButton({
    securityId,
    securityPage,
    securityDesc,
    showConfigButton = true,
    children,
    ...buttonProps
}) {
    const { canAccess, isSuperAdmin, niveles, refreshComponents, getRequiredLevel } = useSecurity();
    const [showConfig, setShowConfig] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar niveles por búsqueda
    const filteredNiveles = useMemo(() => {
        if (!searchTerm.trim()) return niveles;
        const term = searchTerm.toLowerCase();
        return niveles.filter(n => n.nombre?.toLowerCase().includes(term));
    }, [niveles, searchTerm]);

    // Si no tiene securityId, actúa como DSButton normal
    if (!securityId) {
        return <DSButton {...buttonProps}>{children}</DSButton>;
    }

    // Verificar acceso
    const hasAccess = canAccess(securityId);
    const requiredLevelId = getRequiredLevel(securityId); // Ahora devuelve ID
    const currentNivel = niveles.find(n => n.id === requiredLevelId);

    // El botón está bloqueado si: tiene nivel asignado Y el usuario no tiene acceso
    const isBlocked = requiredLevelId !== undefined && !hasAccess;

    // Handler para asignar nivel
    const handleSetLevel = async (nivelId) => {
        setSaving(true);
        try {
            if (nivelId === null) {
                // Quitar protección
                await removeComponenteSecurity(securityId);
            } else {
                // Asignar nivel
                await setComponenteSecurity({
                    componente_id: securityId,
                    pagina: securityPage || window.location.pathname,
                    descripcion: securityDesc || (typeof children === 'string' ? children : securityId),
                    nivel_seguridad_id: nivelId,
                });
            }
            await refreshComponents();
            setShowConfig(false);
        } catch (error) {
            console.error('Error setting security level:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleConfig = (e) => {
        e.stopPropagation();
        setShowConfig(prev => !prev);
    };

    return (
        <span className="secured-button-wrapper">
            {/* El botón principal - deshabilitado si está bloqueado */}
            <DSButton
                {...buttonProps}
                disabled={buttonProps.disabled || isBlocked}
                className={`${buttonProps.className || ''} ${isBlocked ? 'secured-button--blocked' : ''}`}
                title={isBlocked ? `Requiere grupo: ${currentNivel?.nombre || 'Desconocido'}` : buttonProps.title}
            >
                {children}
            </DSButton>

            {/* Indicador de nivel (solo para superadmin) */}
            {isSuperAdmin && showConfigButton && (
                <button
                    type="button"
                    className={`secured-button__config ${requiredLevelId !== undefined ? 'secured-button__config--protected' : ''}`}
                    onClick={toggleConfig}
                    title={requiredLevelId !== undefined
                        ? `Protegido: Grupo ${currentNivel?.nombre || ''}`
                        : 'Público - Clic para configurar'}
                    style={currentNivel?.color ? { '--level-color': currentNivel.color } : undefined}
                >
                    {requiredLevelId !== undefined ? (
                        <Shield size={12} />
                    ) : (
                        <Unlock size={12} />
                    )}
                </button>
            )}

            {/* Menú de configuración (Modal) */}
            {isSuperAdmin && (
                <DSModal
                    isOpen={showConfig}
                    onClose={() => setShowConfig(false)}
                    title="Nivel de Seguridad"
                    icon={<Shield size={20} />}
                    size="sm"
                >
                    <DSModalSection>
                        <div className="secured-button__menu-id" style={{ marginBottom: '0.75rem' }}>
                            ID: <code>{securityId}</code>
                        </div>

                        {/* Buscador */}
                        <div className="secured-button__search" style={{ marginBottom: '0.75rem' }}>
                            <Search size={14} className="secured-button__search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar grupo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="secured-button__search-input"
                            />
                        </div>

                        <div className="secured-button__menu-options">
                            {/* Opción: Sin protección */}
                            <button
                                className={`secured-button__menu-item ${requiredLevelId === undefined ? 'is-selected' : ''}`}
                                onClick={() => handleSetLevel(null)}
                                disabled={saving || requiredLevelId === undefined}
                            >
                                <Unlock size={14} />
                                <span>Público (Cualquiera)</span>
                                {requiredLevelId === undefined && <Check size={14} className="check-icon" />}
                            </button>

                            {/* Grupos disponibles (filtrados) */}
                            {filteredNiveles.map((nivel, index) => (
                                <button
                                    key={nivel.id || `nivel-${index}`}
                                    className={`secured-button__menu-item ${requiredLevelId === nivel.id ? 'is-selected' : ''}`}
                                    onClick={() => handleSetLevel(nivel.id)}
                                    disabled={saving}
                                    style={nivel.color ? { '--level-color': nivel.color } : undefined}
                                >
                                    <span
                                        className="secured-button__level-dot"
                                        style={{ background: nivel.color || '#666' }}
                                    />
                                    <span>{nivel.nombre}</span>
                                    {requiredLevelId === nivel.id && <Check size={14} className="check-icon" />}
                                </button>
                            ))}

                            {filteredNiveles.length === 0 && searchTerm && (
                                <div className="secured-button__no-results">
                                    No se encontraron grupos
                                </div>
                            )}
                        </div>

                        {saving && (
                            <div className="secured-button__menu-loading">
                                Guardando...
                            </div>
                        )}
                    </DSModalSection>
                </DSModal>
            )}
        </span>
    );
}

export default SecuredButton;
