/**
 * Servicio de menú
 * Menú estático para la aplicación de Chat
 */

import {
    Home,
    MessageCircle,
    Settings,
    Users,
    Shield,
    Tag,
    Sparkles,
    FileText,
    Truck,
    Folder,
    BarChart3,
    Bell,
    Dog,
    ShoppingCart,
    Stethoscope,
    Wallet,
    Wrench
} from 'lucide-react';

/**
 * Menú estático de la aplicación
 */
export const staticMenus = [
    {
        codMenu: 'chat',
        descripcion: 'Comunicación',
        submenus: [
            {
                codSubMenu: 'chat-main',
                descripcion: 'Chat',
                rutaReact: '/chat'
            }
        ]
    }
];

/**
 * Obtener menú guardado en localStorage o usar el estático
 * @returns {array}
 */
export function getStoredMenu() {
    try {
        const data = localStorage.getItem('userMenu');
        if (data) {
            return JSON.parse(data);
        }
    } catch {
        localStorage.removeItem('userMenu');
    }
    return staticMenus;
}

/**
 * Guardar menú en localStorage (Normalizando formato)
 * @param {array} menus
 */
export function saveMenu(menus) {
    try {
        // Transformar estructura de backend a frontend si es necesario
        const normalized = menus.map(m => {
            // Si ya viene con formato antiguo, dejarlo pasar
            if (m.codMenu) return m;

            // Transformar formato nuevo (Backend) -> viejo (Frontend Sidebar)
            return {
                codMenu: m.title.toLowerCase().replace(/\s+/g, '-'), // Generar un ID basado en titulo
                descripcion: m.title,
                submenus: m.children?.map(child => ({
                    codSubMenu: child.title.toLowerCase().replace(/\s+/g, '-'),
                    descripcion: child.title,
                    rutaReact: child.url
                })) || []
            };
        });

        localStorage.setItem('userMenu', JSON.stringify(normalized));
    } catch {
        // ignore
        console.error("Error guardando menu");
    }
}

/**
 * Limpiar menú del localStorage
 */
export function clearMenu() {
    localStorage.removeItem('userMenu');
}

/**
 * Íconos del sistema para los menús.
 */
export const menuIcons = {
    NUL: Settings,
    MAN: Wrench,
    USER: Users,
    CAJ: Wallet,
    SPA: Dog,
    SHOP: ShoppingCart,
    VET: Stethoscope,
    TRA: Truck,
    REP: BarChart3,
    REC: Bell,
    FINZ: Wallet,
    NULL: FileText
};

/**
 * Devuelve el componente de ícono para un menú
 * @param {string|number} menuKey - Código o texto del menú
 * @returns {import('react').ComponentType<any>}
 */
export function getMenuIconComponent(menuKey) {
    if (menuKey == null) return Folder;

    const raw = String(menuKey).trim();
    const upper = raw.toUpperCase();
    const lower = raw.toLowerCase();

    if (menuIcons[upper]) return menuIcons[upper];

    // Mapeo por texto
    if (lower.includes('sistema') || lower.includes('config') || lower.includes('ajuste')) return Settings;
    if (lower.includes('manten') || lower.includes('herramient')) return Wrench;
    if (lower.includes('usuario') || lower.includes('personal') || lower.includes('cliente')) return Users;
    if (lower.includes('caja') || lower.includes('finanz') || lower.includes('pago')) return Wallet;
    if (lower.includes('spa')) return Dog;
    if (lower.includes('tienda') || lower.includes('shop') || lower.includes('producto')) return ShoppingCart;
    if (lower.includes('vet')) return Stethoscope;
    if (lower.includes('transporte') || lower.includes('monitoreo')) return Truck;
    if (lower.includes('reporte') || lower.includes('dashboard')) return BarChart3;
    if (lower.includes('chat') || lower.includes('comunic') || lower.includes('mensaje')) return MessageCircle;
    if (lower.includes('notific')) return Bell;

    return Folder;
}

/**
 * Alias retrocompatible
 */
export function getMenuIcon(iconCodeOrText) {
    return getMenuIconComponent(iconCodeOrText);
}

/**
 * Íconos para submenús
 * @param {string|number} subKey
 * @returns {import('react').ComponentType<any>}
 */
export function getSubmenuIconComponent(subKey) {
    if (subKey == null) return FileText;

    const raw = String(subKey).trim();
    const lower = raw.toLowerCase();

    // Por ruta
    if (raw === 'dashboard') return Home;
    if (raw === '/chat') return MessageCircle;
    if (raw === '/sistemas/usuarios') return Users;
    if (raw === '/sistemas/control-accesos') return Shield;
    if (raw === '/tienda/marcas-producto') return Tag;
    if (raw === '/spa/seleccion-spa') return Sparkles;
    if (raw === '/spa/finalizar-fichas') return FileText;
    if (raw === '/transporte/monitoreo-transporte') return Truck;

    // Por texto
    if (lower.includes('chat') || lower.includes('mensaje')) return MessageCircle;
    if (lower.includes('usuario')) return Users;
    if (lower.includes('acceso') || lower.includes('seguridad')) return Shield;
    if (lower.includes('marca')) return Tag;
    if (lower.includes('spa')) return Sparkles;
    if (lower.includes('transporte')) return Truck;

    return FileText;
}

/**
 * Config del header según activePage.
 * @param {string} activePage
 * @returns {{Icon: import('react').ComponentType<any>, title: string}}
 */
export function getHeaderConfig(activePage) {
    const key = activePage || 'dashboard';

    if (key === 'dashboard') return { Icon: Home, title: 'Dashboard' };
    if (key === '/chat') return { Icon: MessageCircle, title: 'Chat' };
    if (key === '/sistemas/usuarios') return { Icon: Users, title: 'Usuarios' };
    if (key === '/sistemas/control-accesos') return { Icon: Shield, title: 'Control de Accesos' };
    if (key === '/tienda/marcas-producto') return { Icon: Tag, title: 'Marcas de Producto' };
    if (key === '/spa/seleccion-spa') return { Icon: Sparkles, title: 'Asignar Fichas SPA' };
    if (key === '/spa/finalizar-fichas') return { Icon: FileText, title: 'Finalizar Fichas' };
    if (key === '/transporte/monitoreo-transporte') return { Icon: Truck, title: 'Monitoreo Transporte' };

    return { Icon: FileText, title: 'Módulo' };
}
