import React from 'react';
import { DSPanel } from '../../ds-layout';
import { Lock, Shield, CheckCircle2 } from 'lucide-react';

/**
 * Página: Control de Accesos (submenu 2)
 * Módulo: SISTEMAS
 */
export function ControlAccesosPage() {
    return (
        <div className="page-container">
            <DSPanel title={<><Lock size={20} style={{ marginRight: 8 }} /> Control de Accesos</>}>
                <div className="page-content">
                    <div className="page-header">
                        <h2>Perfiles y Permisos</h2>
                        <p>Configuración de tipos de usuario y permisos de acceso.</p>
                    </div>

                    <div className="page-placeholder">
                        <div className="placeholder-icon"><Shield size={48} /></div>
                        <h3>Módulo en Desarrollo</h3>
                        <p>Aquí se configurarán los perfiles y permisos del sistema.</p>
                        <ul className="feature-list">
                            <li><CheckCircle2 size={16} /> Tipos de usuario</li>
                            <li><CheckCircle2 size={16} /> Asignación de menús por tipo</li>
                            <li><CheckCircle2 size={16} /> Permisos (CRUD) por módulo</li>
                            <li><CheckCircle2 size={16} /> Roles personalizados</li>
                        </ul>
                    </div>
                </div>
            </DSPanel>
        </div>
    );
}

export default ControlAccesosPage;
