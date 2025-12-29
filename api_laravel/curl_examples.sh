#!/bin/bash
# ============================================================================
# EJEMPLOS DE USO DE LA API DE DIESEL CON cURL
# ============================================================================

# Configurar el token de autenticación (obtener después del login)
TOKEN="tu_token_aquí"
BASE_URL="http://localhost/api"

# ============================================================================
# 1. CATÁLOGOS
# ============================================================================

echo "=== 1. OBTENER DIVISIONES ==="
curl -X GET "${BASE_URL}/diesel/catalogs/divisions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 2. OBTENER UBICACIONES ACTIVAS ==="
curl -X GET "${BASE_URL}/diesel/catalogs/locations?is_active=true" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 3. OBTENER TIPOS DE TRABAJO ==="
curl -X GET "${BASE_URL}/diesel/catalogs/job-types" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 4. OBTENER PROVEEDORES ==="
curl -X GET "${BASE_URL}/diesel/catalogs/suppliers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

# ============================================================================
# 2. TANQUES
# ============================================================================

echo "\n\n=== 5. LISTAR TODOS LOS TANQUES ==="
curl -X GET "${BASE_URL}/diesel/tanks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 6. OBTENER UN TANQUE ESPECÍFICO ==="
curl -X GET "${BASE_URL}/diesel/tanks/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 7. CREAR UN NUEVO TANQUE ==="
curl -X POST "${BASE_URL}/diesel/tanks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Tanque Nuevo",
    "code": "T999",
    "location_id": 1,
    "type": "FIXED",
    "capacity": 8000.00,
    "current_stock": 3000.00,
    "current_meter": 0.00
  }'

# ============================================================================
# 3. MÁQUINAS
# ============================================================================

echo "\n\n=== 8. LISTAR MÁQUINAS ACTIVAS ==="
curl -X GET "${BASE_URL}/diesel/machines?is_active=true" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 9. OBTENER UNA MÁQUINA ESPECÍFICA ==="
curl -X GET "${BASE_URL}/diesel/machines/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 10. CREAR UNA NUEVA MÁQUINA ==="
curl -X POST "${BASE_URL}/diesel/machines" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "code": "D8T",
    "name": "Tractor Oruga D8T",
    "division_id": 1,
    "current_hour_meter": 100.5,
    "is_active": true
  }'

# ============================================================================
# 4. MOVIMIENTOS - ENTRADA (Compra de Diesel)
# ============================================================================

echo "\n\n=== 11. CREAR MOVIMIENTO DE ENTRADA ==="
curl -X POST "${BASE_URL}/diesel/movements" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "type": "ENTRY",
    "date": "2024-12-26 10:30:00",
    "tank_id": 1,
    "location_id": 1,
    "meter_start": 1000.00,
    "meter_end": 1500.00,
    "supplier_id": 1,
    "unit_price": 1.50,
    "user_id": 1,
    "authorized_by_pin_id": 2,
    "receipt_series": "M1",
    "receipt_number": "000348",
    "notes": "Ingreso de proveedor Petrobras"
  }'

# ============================================================================
# 5. MOVIMIENTOS - SALIDA (Consumo de Máquina)
# ============================================================================

echo "\n\n=== 12. CREAR MOVIMIENTO DE SALIDA ==="
curl -X POST "${BASE_URL}/diesel/movements" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "type": "EXIT",
    "date": "2024-12-26 14:00:00",
    "tank_id": 1,
    "location_id": 1,
    "meter_start": 1500.00,
    "meter_end": 1580.00,
    "machine_id": 1,
    "job_type_id": 1,
    "hour_meter": 1251.5,
    "oil_liters": 2.5,
    "driver_id": 1,
    "receiver_id": 2,
    "user_id": 1,
    "authorized_by_pin_id": 2,
    "receipt_series": "M1",
    "receipt_number": "000349",
    "notes": "Trabajo de desmonte en campo 4"
  }'

# ============================================================================
# 6. MOVIMIENTOS - TRASPASO
# ============================================================================

echo "\n\n=== 13. CREAR MOVIMIENTO DE TRASPASO ==="
curl -X POST "${BASE_URL}/diesel/movements" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "type": "TRANSFER",
    "date": "2024-12-26 16:00:00",
    "tank_id": 1,
    "destination_tank_id": 2,
    "location_id": 1,
    "meter_start": 1580.00,
    "meter_end": 1680.00,
    "driver_id": 1,
    "user_id": 1,
    "authorized_by_pin_id": 2,
    "notes": "Traspaso a tanque de campo 4"
  }'

# ============================================================================
# 7. MOVIMIENTOS - AJUSTE
# ============================================================================

echo "\n\n=== 14. CREAR MOVIMIENTO DE AJUSTE ==="
curl -X POST "${BASE_URL}/diesel/movements" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "type": "ADJUSTMENT",
    "date": "2024-12-26 18:00:00",
    "tank_id": 1,
    "location_id": 1,
    "meter_start": 1680.00,
    "meter_end": 1680.00,
    "liters": -10.00,
    "user_id": 1,
    "authorized_by_pin_id": 3,
    "notes": "Ajuste por derrame detectado en inspección diaria"
  }'

# ============================================================================
# 8. LISTAR Y FILTRAR MOVIMIENTOS
# ============================================================================

echo "\n\n=== 15. LISTAR TODOS LOS MOVIMIENTOS ==="
curl -X GET "${BASE_URL}/diesel/movements" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 16. FILTRAR MOVIMIENTOS POR TIPO ==="
curl -X GET "${BASE_URL}/diesel/movements?type=EXIT" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 17. FILTRAR MOVIMIENTOS POR TANQUE ==="
curl -X GET "${BASE_URL}/diesel/movements?tank_id=1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 18. FILTRAR MOVIMIENTOS POR UBICACIÓN ==="
curl -X GET "${BASE_URL}/diesel/movements?location_id=1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 19. FILTRAR MOVIMIENTOS POR RANGO DE FECHAS ==="
curl -X GET "${BASE_URL}/diesel/movements?start_date=2024-12-01&end_date=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 20. FILTRAR MOVIMIENTOS VÁLIDOS ==="
curl -X GET "${BASE_URL}/diesel/movements?status=VALID" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

# ============================================================================
# 9. VER MOVIMIENTO ESPECÍFICO
# ============================================================================

echo "\n\n=== 21. VER UN MOVIMIENTO ESPECÍFICO ==="
curl -X GET "${BASE_URL}/diesel/movements/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

# ============================================================================
# 10. ANULAR UN MOVIMIENTO
# ============================================================================

echo "\n\n=== 22. ANULAR UN MOVIMIENTO ==="
curl -X POST "${BASE_URL}/diesel/movements/1/void" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "void_reason": "Error en digitación, se cargó máquina incorrecta",
    "authorized_by_pin_id": 3
  }'

# ============================================================================
# 11. ESTADÍSTICAS
# ============================================================================

echo "\n\n=== 23. OBTENER ESTADÍSTICAS GENERALES ==="
curl -X GET "${BASE_URL}/diesel/movements/statistics" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 24. OBTENER ESTADÍSTICAS POR PERÍODO ==="
curl -X GET "${BASE_URL}/diesel/movements/statistics?start_date=2024-12-01&end_date=2024-12-31" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

echo "\n\n=== 25. OBTENER ESTADÍSTICAS POR UBICACIÓN ==="
curl -X GET "${BASE_URL}/diesel/movements/statistics?location_id=1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json"

# ============================================================================
# NOTAS DE USO
# ============================================================================

# Para ejecutar este script:
# 1. Reemplaza TOKEN con tu token de autenticación real
# 2. Ajusta BASE_URL según tu configuración (localhost, dominio, etc.)
# 3. Dale permisos de ejecución: chmod +x curl_examples.sh
# 4. Ejecuta: ./curl_examples.sh

# Para Windows (PowerShell), usa:
# Invoke-WebRequest en lugar de curl
# O instala curl para Windows desde: https://curl.se/windows/
