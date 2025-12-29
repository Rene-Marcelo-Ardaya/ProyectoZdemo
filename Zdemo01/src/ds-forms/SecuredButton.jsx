import React, { useState, useMemo } from 'react';
import { Shield, Check, Unlock, Search } from 'lucide-react';
import { useSecurity } from '../core/SecurityContext';
import { setComponenteSecurity, removeComponenteSecurity } from '../services/securityLevelService';
import { DSButton } from './DSButton';
import { DSModal, DSModalSection } from '../ds-overlays';
import './SecuredButton.css';

/**
 * SecuredButton - Botón con control de seguridad por niveles
 * 
 * @param {string} securityId - ID único del botón (ej: "usuarios.crear")
 * @param {string} securityPage - Página donde está el botón
 * @param {string} securityDesc - Descripción del botón (para admin)
 * @param {boolean} showConfigButton - Mostrar botón config para admin
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

    // Si no tiene securityId, actúa como botón normal
    if (!securityId) {
        return <DSButton {...buttonProps}>{children}</DSButton>;
    }

    // Verificar acceso
    const hasAccess = canAccess(securityId);
    const requiredLevelId = getRequiredLevel(securityId);
    const currentNivel = niveles.find(n => n.id === requiredLevelId);

    // Bloqueado si: tiene nivel asignado Y el usuario no tiene acceso
    const isBlocked = requiredLevelId !== undefined && !hasAccess;

    // Asignar nivel
    const handleSetLevel = async (nivelId) => {
        setSaving(true);
        try {
            if (nivelId === null) {
                await removeComponenteSecurity(securityId);
            } else {
                await setComponenteSecurity({
                    componente_id: securityId,
                    pagina: securityPage || window.location.pathname,
                    descripcion: securityDesc || securityId,
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

    return (
        <span className="secured-button-wrapper">
            {/* Botón principal */}
            <DSButton
                {...buttonProps}
                disabled={buttonProps.disabled || isBlocked}
                className={`${buttonProps.className || ''} ${isBlocked ? 'secured-button--blocked' : ''}`}
                title={isBlocked ? `Requiere grupo: ${currentNivel?.nombre}` : buttonProps.title}
            >
                {children}
            </DSButton>

            {/* Indicador de nivel (solo para SuperAdmin) */}
            {isSuperAdmin && showConfigButton && (
                <button
                    type="button"
                    className={`secured-button__config ${requiredLevelId ? 'secured-button__config--protected' : ''}`}
                    onClick={() => setShowConfig(true)}
                    title={requiredLevelId ? `Protegido: ${currentNivel?.nombre}` : 'Público - Clic para configurar'}
                    style={currentNivel?.color ? { '--level-color': currentNivel.color } : undefined}
                >
                    {requiredLevelId ? <Shield size={12} /> : <Unlock size={12} />}
                </button>
            )}

            {/* Modal de configuración */}
            {isSuperAdmin && (
                <DSModal
                    isOpen={showConfig}
                    onClose={() => setShowConfig(false)}
                    title="Nivel de Seguridad"
                    icon={<Shield size={20} />}
                    size="sm"
                >
                    <DSModalSection>
                        <div className="secured-button__menu-id">
                            ID: <code>{securityId}</code>
                        </div>

                        {/* Buscador */}
                        <div className="secured-button__search">
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
                                className={`secured-button__menu-item ${!requiredLevelId ? 'is-selected' : ''}`}
                                onClick={() => handleSetLevel(null)}
                                disabled={saving || !requiredLevelId}
                            >
                                <Unlock size={14} />
                                <span>Público (Cualquiera)</span>
                                {!requiredLevelId && <Check size={14} className="check-icon" />}
                            </button>

                            {/* Grupos disponibles */}
                            {filteredNiveles.map((nivel) => (
                                <button
                                    key={nivel.id}
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
                        </div>

                        {saving && <div className="secured-button__menu-loading">Guardando...</div>}
                    </DSModalSection>
                </DSModal>
            )}
        </span>
    );
}

export default SecuredButton;
