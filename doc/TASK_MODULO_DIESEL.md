# 📋 TAREAS - Módulo de Control de Diésel

> **Proyecto:** DemoZ01  
> **Módulo:** Control de Combustible Diésel  
> **Estado:** Pendiente de inicio  
> **Última actualización:** 26/12/2024

---

## 🛢️ SECCIÓN 1: TANQUES (Estáticos y Móviles)

> **Tipos de Tanques:**
> - 🏭 **ESTÁTICO**: Tanques fijos en planta/base
> - 🚚 **MÓVIL**: Cisternas que se desplazan a campo/obra

### Backend
- [x] Crear migración `create_tanques_table`
  - [x] Campos básicos: id, nombre, capacidad_litros, nivel_actual, nivel_minimo_alerta, estado
  - [x] Campo tipo: `tipo` ENUM('ESTATICO', 'MOVIL')
  - [x] Campos para ESTÁTICO: ubicacion_fija
  - [x] Campos para MÓVIL: placa_cisterna, vehiculo_asignado_id, responsable_id
- [x] Crear modelo `Tanque.php` con relaciones
- [x] Crear `TanqueController.php` con CRUD
- [x] Agregar rutas API `/api/diesel/tanques`
- [x] Filtros por tipo (estático/móvil)
- [x] Crear seeder con datos de prueba (ambos tipos)

### Frontend
- [x] Crear página `TanquesPage.jsx`
- [x] Implementar tabla de tanques con DSTable
- [x] Tabs o filtro para separar Estáticos vs Móviles
- [x] Modal para crear/editar tanque (campos dinámicos según tipo)
- [x] Componente `TanqueGauge.jsx` (indicador visual de nivel)
- [x] Icono visual diferente para cada tipo (🏭 / 🚚)
- [x] Integrar con SecuredButton para permisos

---

## 🚗 SECCIÓN 2: VEHÍCULOS Y MAQUINARIA

### Backend
- [ ] Crear migración `create_vehiculos_table`
  - [ ] Campos: id, placa, tipo, marca, modelo, año, capacidad_tanque, consumo_promedio, kilometraje_actual, departamento_id, responsable_id, estado
- [ ] Crear modelo `Vehiculo.php` con relaciones
- [ ] Crear `VehiculoController.php` con CRUD
- [ ] Agregar rutas API `/api/diesel/vehiculos`
- [ ] Crear seeder con datos de prueba

### Frontend
- [ ] Crear página `VehiculosPage.jsx`
- [ ] Implementar tabla de vehículos/maquinaria
- [ ] Modal para crear/editar vehículo
- [ ] Filtros por tipo (vehículo, maquinaria, generador)
- [ ] Mostrar estadísticas de consumo por vehículo
- [ ] Integrar con SecuredButton para permisos
---

## ⛽ SECCIÓN 3: RECARGAS DE TANQUE (INGRESOS)

### Backend
- [ ] Crear migración `create_recargas_tanque_table`
  - [ ] Campos: id, tanque_id, cantidad_litros, proveedor, numero_factura, costo_total, costo_por_litro, fecha_recarga, usuario_id, observaciones
- [ ] Crear modelo `RecargaTanque.php`
- [ ] Crear `RecargaController.php`
- [ ] Agregar rutas API `/api/diesel/recargas`
- [ ] Lógica para actualizar nivel del tanque automáticamente

### Frontend
- [ ] Crear página/sección `RecargasPage.jsx`
- [ ] Formulario de registro de recarga
- [ ] Historial de recargas por tanque
- [ ] Cálculo automático de costo por litro

---

## � SECCIÓN 3.5: TRANSFERENCIAS (Estático → Móvil)

> **Concepto:** Cuando una cisterna (tanque móvil) se carga desde un tanque estático antes de ir a campo.

### Backend
- [ ] Crear migración `create_transferencias_table`
  - [ ] Campos: id, tanque_origen_id, tanque_destino_id, cantidad_litros, fecha_transferencia, operador_id, observaciones
- [ ] Crear modelo `Transferencia.php`
- [ ] Crear `TransferenciaController.php`
- [ ] Agregar rutas API `/api/diesel/transferencias`
- [ ] Actualizar niveles automáticamente en ambos tanques (restar origen, sumar destino)

### Frontend
- [ ] Formulario de transferencia (origen estático → destino móvil)
- [ ] Historial de transferencias
- [ ] Validación: origen debe tener nivel suficiente

---

## �📋 SECCIÓN 4: DESPACHOS (Salidas/Boletas)

> **Ahora los despachos pueden ser:**
> - Desde tanque ESTÁTICO → Vehículo (en planta)
> - Desde tanque MÓVIL → Vehículo (en campo)

### Backend
- [ ] Crear migración `create_despachos_table`
  - [ ] Campos: id, numero_boleta, tanque_id, vehiculo_id, operador_id, conductor_id, autorizador_id, cantidad_litros, kilometraje, horometro, fecha_despacho, hora_despacho, observaciones
- [ ] Crear modelo `Despacho.php` con relaciones
- [ ] Crear `DespachoController.php`
- [ ] Agregar rutas API `/api/diesel/despachos`
- [ ] Generador automático de número de boleta
- [ ] Validaciones:
  - [ ] Nivel de tanque suficiente
  - [ ] Kilometraje mayor al último registro
  - [ ] Horómetro mayor al último registro

### Frontend
- [ ] Crear página `DespachosPage.jsx`
- [ ] Formulario de despacho (digitalizar boleta física)
- [ ] Selector de tanque con nivel disponible
- [ ] Selector de vehículo con último km/horómetro
- [ ] Historial de despachos con filtros
- [ ] Botón imprimir boleta digital
- [ ] Vista previa de boleta para impresión

---

## 📊 SECCIÓN 5: DASHBOARD

### Backend
- [ ] Crear `DashboardDieselController.php`
- [ ] Endpoint resumen de niveles de tanques
- [ ] Endpoint consumo del día/semana/mes
- [ ] Endpoint top vehículos consumidores
- [ ] Endpoint alertas activas

### Frontend
- [ ] Crear página `DieselDashboardPage.jsx`
- [ ] Componente indicadores de nivel de tanques
- [ ] Gráfico de consumo diario/semanal
- [ ] Lista de alertas de nivel bajo
- [ ] Acceso rápido a registro de despacho
- [ ] Resumen de últimos despachos

---

## 📈 SECCIÓN 6: REPORTES

### Backend
- [ ] Crear `ReporteDieselController.php`
- [ ] Reporte consumo por vehículo (filtro por fechas)
- [ ] Reporte consumo por departamento
- [ ] Reporte rendimiento (km/litro) por vehículo
- [ ] Reporte historial de recargas
- [ ] Exportación a Excel
- [ ] Exportación a PDF

### Frontend
- [ ] Crear página `ReportesDieselPage.jsx`
- [ ] Selector de tipo de reporte
- [ ] Filtros de fecha (desde/hasta)
- [ ] Filtros por vehículo/departamento
- [ ] Visualización en tabla
- [ ] Gráficos de consumo
- [ ] Botones de exportación

---

## 🔐 SECCIÓN 7: PERMISOS Y MENÚS

### Backend
- [ ] Crear migración para agregar menús del módulo diésel
- [ ] Crear grupos de seguridad:
  - [ ] `DIESEL_VER` - Ver información
  - [ ] `DIESEL_DESPACHAR` - Registrar despachos
  - [ ] `DIESEL_RECARGAR` - Registrar recargas
  - [ ] `DIESEL_ADMIN` - Gestión completa
  - [ ] `DIESEL_REPORTES` - Acceso a reportes

### Frontend
- [ ] Agregar menús al sidebar
- [ ] Configurar rutas en `App.jsx`
- [ ] Aplicar SecuredButton en todas las acciones
- [ ] Validar permisos en cada página

---

## 🧪 SECCIÓN 8: PRUEBAS Y VALIDACIÓN

- [ ] Probar flujo completo de recarga de tanque
- [ ] Probar flujo completo de despacho
- [ ] Verificar cálculo de rendimiento
- [ ] Probar generación de reportes
- [ ] Probar exportación Excel/PDF
- [ ] Validar alertas de nivel bajo
- [ ] Pruebas con múltiples tanques
- [ ] Pruebas de permisos por rol

---

## 📝 NOTAS Y PENDIENTES

- [ ] Definir si se requiere firma digital
- [ ] Definir formato exacto de impresión de boleta
- [ ] Confirmar campos adicionales necesarios
- [ ] Definir alertas por email vs notificación en app

---

## 📅 CRONOGRAMA ESTIMADO

| Sección | Duración | Estado |
|---------|----------|--------|
| Tanques | 1-2 días | ⬜ Pendiente |
| Vehículos | 1-2 días | ⬜ Pendiente |
| Recargas | 1 día | ⬜ Pendiente |
| Despachos | 2-3 días | ⬜ Pendiente |
| Dashboard | 1-2 días | ⬜ Pendiente |
| Reportes | 2 días | ⬜ Pendiente |
| Permisos | 1 día | ⬜ Pendiente |
| Pruebas | 1-2 días | ⬜ Pendiente |
| **TOTAL** | **10-15 días** | |

---

*Documento de seguimiento para el desarrollo del Módulo de Control de Diésel*
