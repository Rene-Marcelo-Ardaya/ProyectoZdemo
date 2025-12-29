import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchComponentesSecurity, fetchNivelesActivos } from '../services/securityLevelService';

const SecurityContext = createContext(null);

export function SecurityProvider({ children, user }) {
    const [componentes, setComponentes] = useState({});  // { componenteId: nivelRequeridoId }
    const [niveles, setNiveles] = useState([]);
    const [userLevel, setUserLevel] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Cargar datos al montar
    const loadSecurityData = useCallback(async () => {
        try {
            const [componentesRes, nivelesRes] = await Promise.all([
                fetchComponentesSecurity(),
                fetchNivelesActivos()
            ]);

            if (componentesRes.success) {
                const componentesMap = {};
                (componentesRes.data || []).forEach(c => {
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

    // Actualizar nivel del usuario
    useEffect(() => {
        if (user) {
            // El usuario tiene un grupo asignado via personal.nivel_seguridad_id
            const nivelId = user.personal?.nivel_seguridad?.id || user.personal?.nivel_seguridad_id;
            setUserLevel(nivelId);

            // Verificar si es SuperAdmin
            const roles = Array.isArray(user.roles) ? user.roles : [];
            const hasSuperAdminRole = roles.some(role => {
                const slug = (typeof role === 'string' ? role : role.slug || '').toLowerCase();
                return slug === 'superadmin' || slug === 'super-admin';
            });
            setIsSuperAdmin(hasSuperAdminRole || user.is_superadmin);
        }
    }, [user]);

    // Verificar si el usuario puede acceder a un componente
    const canAccess = useCallback((componenteId) => {
        if (isSuperAdmin) return true;  // SuperAdmin siempre tiene acceso

        const nivelRequeridoId = componentes[componenteId];
        if (!nivelRequeridoId) return true;  // Sin protección = público

        return userLevel === nivelRequeridoId;  // Comparación directa de IDs
    }, [componentes, userLevel, isSuperAdmin]);

    // Obtener nivel requerido para un componente
    const getRequiredLevel = useCallback((componenteId) => {
        return componentes[componenteId];
    }, [componentes]);

    // Recargar componentes (después de cambios)
    const refreshComponents = useCallback(async () => {
        try {
            const componentesRes = await fetchComponentesSecurity();
            if (componentesRes.success) {
                const componentesMap = {};
                (componentesRes.data || []).forEach(c => {
                    componentesMap[c.componente_id] = c.nivel_seguridad_id;
                });
                setComponentes(componentesMap);
            }
        } catch (error) {
            console.error('Error refreshing components:', error);
        }
    }, []);

    const value = {
        canAccess,
        getRequiredLevel,
        isSuperAdmin,
        userLevel,
        niveles,
        componentes,
        refreshComponents,
        loading,
    };

    return (
        <SecurityContext.Provider value={value}>
            {children}
        </SecurityContext.Provider>
    );
}

export function useSecurity() {
    const context = useContext(SecurityContext);
    if (!context) {
        // Sin provider, todo permitido
        return {
            canAccess: () => true,
            getRequiredLevel: () => undefined,
            isSuperAdmin: false,
            userLevel: null,
            niveles: [],
            componentes: {},
            refreshComponents: async () => { },
            loading: false,
        };
    }
    return context;
}
