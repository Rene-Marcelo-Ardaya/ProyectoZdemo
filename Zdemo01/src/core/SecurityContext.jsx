/**
 * Security Context
 * Provides security level checking for protected components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchComponentesSecurity, fetchNivelesActivos } from '../services/securityLevelService';

const SecurityContext = createContext(null);

/**
 * SecurityProvider - Provee el contexto de seguridad a la aplicación
 * 
 * @param {React.ReactNode} children - Componentes hijos
 * @param {Object} user - Usuario actual (debe incluir personal.nivel_seguridad y roles)
 */
export function SecurityProvider({ children, user }) {
    const [componentes, setComponentes] = useState({});  // { componenteId: nivelRequerido }
    const [niveles, setNiveles] = useState([]);
    const [userLevel, setUserLevel] = useState(0);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Cargar datos de seguridad al montar
    const loadSecurityData = useCallback(async () => {
        try {
            const [componentesRes, nivelesRes] = await Promise.all([
                fetchComponentesSecurity(),
                fetchNivelesActivos()
            ]);

            // Mapear componentes a { componenteId: nivelId }
            if (componentesRes.success) {
                const componentesMap = {};
                (componentesRes.data || []).forEach(c => {
                    // Ahora guardamos el ID del nivel, no el valor numérico
                    componentesMap[c.componente_id] = c.nivel_seguridad_id;
                });
                setComponentes(componentesMap);
            }

            if (nivelesRes.success) {
                setNiveles(nivelesRes.data || []);
            }
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
            // El usuario ahora tiene un GRUPO asignado (nivel_seguridad_id)
            // Podría ser un array en el futuro, pero por ahora asumimos uno principal.
            // Si el backend envía user.personal.nivel_seguridad_id directamente es mejor.
            // Si envía objeto: user.personal.nivel_seguridad.id
            const nivelId = user.personal?.nivel_seguridad?.id || user.personal?.nivel_seguridad_id;
            setUserLevel(nivelId); // Reusamos userLevel como variable, pero ahora guarda ID

            // Verify if superadmin
            const roles = Array.isArray(user.roles) ? user.roles : [];

            // Check checking strategies
            const hasSuperAdminRole = roles.some(role => {
                // Handle role as object or string
                const roleSlug = (typeof role === 'string' ? role : role.slug || role.name || '').toLowerCase();
                const roleName = (typeof role === 'string' ? role : role.name || role.slug || '').toLowerCase();

                return roleSlug === 'superadmin' ||
                    roleSlug === 'super-admin' ||
                    roleName.includes('super admin') ||
                    roleName.includes('superadmin');
            });

            // Also check direct flag if exists
            const isDirectSuperAdmin = user.is_superadmin === true || user.is_superadmin === 1;

            const isAdmin = hasSuperAdminRole || isDirectSuperAdmin;

            setIsSuperAdmin(isAdmin);
        } else {
            setUserLevel(null);
            setIsSuperAdmin(false);
        }
    }, [user]);

    /**
     * Verificar si el usuario puede acceder a un componente
     * @param {string} componenteId - ID único del componente
     * @returns {boolean} - true si tiene acceso
     */
    const canAccess = useCallback((componenteId) => {
        // SuperAdmin siempre tiene acceso
        if (isSuperAdmin) return true;

        // Si el componente no tiene nivel asignado, es público
        const nivelRequeridoId = componentes[componenteId];
        if (!nivelRequeridoId) return true;

        // Comparación directa de IDs: El usuario debe tener el ID del grupo requerido
        // userLevel ahora guarda el ID del grupo del usuario
        return userLevel === nivelRequeridoId;
    }, [componentes, userLevel, isSuperAdmin]);

    /**
     * Obtener el nivel requerido para un componente
     * @param {string} componenteId - ID del componente
     * @returns {number|undefined} - ID del nivel requerido o undefined
     */
    const getRequiredLevel = useCallback((componenteId) => {
        return componentes[componenteId];
    }, [componentes]);

    /**
     * Recargar los componentes protegidos (después de cambios)
     */
    const refreshComponents = useCallback(async () => {
        const componentesRes = await fetchComponentesSecurity();
        if (componentesRes.success) {
            const componentesMap = {};
            (componentesRes.data || []).forEach(c => {
                componentesMap[c.componente_id] = c.nivel_seguridad_id;
            });
            setComponentes(componentesMap);
        }
    }, []);

    /**
     * Recargar los niveles de seguridad (después de crear/eliminar)
     */
    const refreshNiveles = useCallback(async () => {
        const nivelesRes = await fetchNivelesActivos();
        if (nivelesRes.success) {
            setNiveles(nivelesRes.data || []);
        }
    }, []);

    const value = {
        canAccess,
        getRequiredLevel,
        isSuperAdmin,
        userLevel, // Ahora es el ID del grupo
        niveles,
        componentes,
        refreshComponents,
        refreshNiveles,
        loading,
    };

    return (
        <SecurityContext.Provider value={value}>
            {children}
        </SecurityContext.Provider>
    );
}

/**
 * Hook para acceder al contexto de seguridad
 */
export function useSecurity() {
    const context = useContext(SecurityContext);
    if (!context) {
        // Si no hay provider, retornar valores por defecto (todo permitido)
        return {
            canAccess: () => true,
            getRequiredLevel: () => undefined,
            isSuperAdmin: false,
            userLevel: 0,
            niveles: [],
            componentes: {},
            refreshComponents: async () => { },
            loading: false,
        };
    }
    return context;
}

export default SecurityContext;
