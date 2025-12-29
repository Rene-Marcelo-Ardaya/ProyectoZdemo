import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PinModal from './PinModal';
import {
  getTanks,
  getLocations,
  getSuppliers,
  getMachines,
  getJobTypes,
  getPersonal,
  createMovement,
  handleApiError,
} from '../../services/dieselService';

/**
 * Formulario de Movimientos de Diesel
 * 
 * Formulario dinámico que cambia según el tipo de movimiento:
 * - ENTRY (Entrada): Pide proveedor y precio
 * - EXIT (Salida): Pide máquina, tipo de trabajo y horómetro
 * - TRANSFER (Traspaso): Pide tanque destino
 * - ADJUSTMENT (Ajuste): Pide motivo obligatorio
 * 
 * Valida PIN antes de enviar al backend
 */
const MovementForm = ({ onSuccess, onCancel, initialType = 'EXIT' }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    type: initialType,
    date: new Date().toISOString().slice(0, 16), // formato YYYY-MM-DDTHH:mm
    tank_id: '',
    location_id: '',
    meter_start: '',
    meter_end: '',
    liters: '',
    
    // Para ENTRY
    supplier_id: '',
    unit_price: '',
    
    // Para EXIT
    machine_id: '',
    job_type_id: '',
    hour_meter: '',
    oil_liters: '0',
    driver_id: '',
    receiver_id: '',
    
    // Para TRANSFER
    destination_tank_id: '',
    
    // Comunes
    receipt_series: '',
    receipt_number: '',
    notes: '',
    user_id: '', // Se llenará del usuario autenticado
    authorized_by_pin_id: '', // Se llenará del modal PIN
  });

  // Catálogos
  const [tanks, setTanks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [personnel, setPersonnel] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Cargar catálogos al montar
  useEffect(() => {
    loadCatalogs();
    
    // Obtener user_id del localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setFormData(prev => ({ ...prev, user_id: user.id }));
    }
  }, []);

  // Cargar tanques cuando cambia la ubicación
  useEffect(() => {
    if (formData.location_id) {
      loadTanks(formData.location_id);
    }
  }, [formData.location_id]);

  // Calcular litros automáticamente
  useEffect(() => {
    if (formData.meter_start && formData.meter_end) {
      const start = parseFloat(formData.meter_start);
      const end = parseFloat(formData.meter_end);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        setFormData(prev => ({
          ...prev,
          liters: (end - start).toFixed(2)
        }));
      }
    }
  }, [formData.meter_start, formData.meter_end]);

  const loadCatalogs = async () => {
    try {
      const [locsRes, suppsRes, machsRes, jobsRes, persRes] = await Promise.all([
        getLocations({ is_active: true }),
        getSuppliers(),
        getMachines({ is_active: true }),
        getJobTypes({ is_active: true }),
        getPersonal({ estado: 'activo' }),
      ]);

      setLocations(locsRes.data || []);
      setSuppliers(suppsRes.data || []);
      setMachines(machsRes.data || []);
      setJobTypes(jobsRes.data || []);
      setPersonnel(persRes.data || []);
    } catch (err) {
      setError('Error al cargar catálogos: ' + handleApiError(err));
    }
  };

  const loadTanks = async (locationId) => {
    try {
      const response = await getTanks({ location_id: locationId });
      setTanks(response.data || []);
    } catch (err) {
      setError('Error al cargar tanques: ' + handleApiError(err));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar campos dependientes al cambiar el tipo
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        supplier_id: '',
        unit_price: '',
        machine_id: '',
        job_type_id: '',
        hour_meter: '',
        destination_tank_id: '',
      }));
    }

    // Limpiar tanque al cambiar ubicación
    if (name === 'location_id') {
      setFormData(prev => ({ ...prev, tank_id: '' }));
    }
  };

  const validateForm = () => {
    // Validaciones básicas
    if (!formData.location_id) return 'Debe seleccionar una ubicación';
    if (!formData.tank_id) return 'Debe seleccionar un tanque';
    if (!formData.meter_start) return 'Debe ingresar la lectura inicial del medidor';
    if (!formData.meter_end) return 'Debe ingresar la lectura final del medidor';
    
    const start = parseFloat(formData.meter_start);
    const end = parseFloat(formData.meter_end);
    if (end < start) return 'La lectura final no puede ser menor a la inicial';

    // Validaciones específicas por tipo
    if (formData.type === 'ENTRY') {
      if (!formData.supplier_id) return 'Debe seleccionar un proveedor';
      if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) 
        return 'Debe ingresar un precio unitario válido';
    }

    if (formData.type === 'EXIT') {
      if (!formData.machine_id) return 'Debe seleccionar una máquina';
      if (!formData.job_type_id) return 'Debe seleccionar un tipo de trabajo';
      if (!formData.hour_meter) return 'Debe ingresar el horómetro';
    }

    if (formData.type === 'TRANSFER') {
      if (!formData.destination_tank_id) return 'Debe seleccionar un tanque destino';
      if (formData.destination_tank_id === formData.tank_id) 
        return 'El tanque destino debe ser diferente al origen';
    }

    if (formData.type === 'ADJUSTMENT') {
      if (!formData.notes || formData.notes.trim().length < 10) 
        return 'Debe explicar el motivo del ajuste (mínimo 10 caracteres)';
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Abrir modal de PIN
    setPendingSubmit(true);
    setShowPinModal(true);
  };

  const handlePinSuccess = async (personalId) => {
    try {
      setLoading(true);
      setError('');

      // Preparar datos con el personal autorizado
      const dataToSend = {
        ...formData,
        authorized_by_pin_id: personalId,
        date: new Date(formData.date).toISOString(),
      };

      // Limpiar campos no necesarios según el tipo
      if (dataToSend.type !== 'ENTRY') {
        delete dataToSend.supplier_id;
        delete dataToSend.unit_price;
      }
      if (dataToSend.type !== 'EXIT') {
        delete dataToSend.machine_id;
        delete dataToSend.job_type_id;
        delete dataToSend.hour_meter;
        delete dataToSend.oil_liters;
        delete dataToSend.driver_id;
        delete dataToSend.receiver_id;
      }
      if (dataToSend.type !== 'TRANSFER') {
        delete dataToSend.destination_tank_id;
      }

      // Enviar al backend
      const response = await createMovement(dataToSend);

      // Éxito
      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
      setPendingSubmit(false);
    }
  };

  const getTitle = () => {
    switch (formData.type) {
      case 'ENTRY': return '📥 Registrar Entrada de Diesel';
      case 'EXIT': return '📤 Registrar Salida de Diesel';
      case 'TRANSFER': return '🔄 Registrar Traspaso';
      case 'ADJUSTMENT': return '⚙️ Registrar Ajuste';
      default: return 'Registrar Movimiento';
    }
  };

  return (
    <div className="movement-form" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {getTitle()}
          </h2>
        </div>

        {/* Error general */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            color: '#dc2626',
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Tipo de Movimiento */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Tipo de Movimiento <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          >
            <option value="ENTRY">📥 Entrada (Compra)</option>
            <option value="EXIT">📤 Salida (Consumo)</option>
            <option value="TRANSFER">🔄 Traspaso</option>
            <option value="ADJUSTMENT">⚙️ Ajuste</option>
          </select>
        </div>

        {/* Fecha y Hora */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Fecha y Hora <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="datetime-local"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Ubicación */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Ubicación <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            name="location_id"
            className="form-control"
            value={formData.location_id}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          >
            <option value="">-- Seleccione una ubicación --</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Tanque Origen */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Tanque {formData.type === 'TRANSFER' ? 'Origen' : ''} <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            name="tank_id"
            className="form-control"
            value={formData.tank_id}
            onChange={handleChange}
            required
            disabled={!formData.location_id}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          >
            <option value="">-- Seleccione un tanque --</option>
            {tanks.map(tank => (
              <option key={tank.id} value={tank.id}>
                {tank.name} ({tank.code}) - Stock: {tank.current_stock}L
              </option>
            ))}
          </select>
        </div>

        {/* Lecturas del Medidor */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Medidor Inicial <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              name="meter_start"
              className="form-control"
              value={formData.meter_start}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Medidor Final <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              name="meter_end"
              className="form-control"
              value={formData.meter_end}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Litros
            </label>
            <input
              type="number"
              name="liters"
              className="form-control"
              value={formData.liters}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: '#f9fafb',
              }}
            />
          </div>
        </div>

        {/* Campos específicos para ENTRY */}
        {formData.type === 'ENTRY' && (
          <>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Proveedor <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="supplier_id"
                className="form-control"
                value={formData.supplier_id}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                <option value="">-- Seleccione un proveedor --</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Precio Unitario (Bs/L) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                name="unit_price"
                className="form-control"
                value={formData.unit_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Mostrar costo total calculado */}
            {formData.liters && formData.unit_price && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                marginBottom: '1.5rem',
              }}>
                <strong>💰 Costo Total:</strong> Bs {(parseFloat(formData.liters) * parseFloat(formData.unit_price)).toFixed(2)}
              </div>
            )}
          </>
        )}

        {/* Campos específicos para EXIT */}
        {formData.type === 'EXIT' && (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Máquina <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="machine_id"
                  className="form-control"
                  value={formData.machine_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="">-- Seleccione una máquina --</option>
                  {machines.map(mach => (
                    <option key={mach.id} value={mach.id}>
                      {mach.code} - {mach.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Tipo de Trabajo <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="job_type_id"
                  className="form-control"
                  value={formData.job_type_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="">-- Seleccione tipo de trabajo --</option>
                  {jobTypes.map(job => (
                    <option key={job.id} value={job.id}>{job.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Horómetro <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  name="hour_meter"
                  className="form-control"
                  value={formData.hour_meter}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                  placeholder="0.0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Aceite (L)
                </label>
                <input
                  type="number"
                  name="oil_liters"
                  className="form-control"
                  value={formData.oil_liters}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Chofer / Entrega
                </label>
                <select
                  name="driver_id"
                  className="form-control"
                  value={formData.driver_id}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="">-- Opcional --</option>
                  {personnel.map(pers => (
                    <option key={pers.id} value={pers.id}>
                      {pers.nombre} {pers.apellido_paterno}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Recibe
                </label>
                <select
                  name="receiver_id"
                  className="form-control"
                  value={formData.receiver_id}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="">-- Opcional --</option>
                  {personnel.map(pers => (
                    <option key={pers.id} value={pers.id}>
                      {pers.nombre} {pers.apellido_paterno}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Campos específicos para TRANSFER */}
        {formData.type === 'TRANSFER' && (
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Tanque Destino <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="destination_tank_id"
              className="form-control"
              value={formData.destination_tank_id}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">-- Seleccione tanque destino --</option>
              {tanks.filter(t => t.id.toString() !== formData.tank_id).map(tank => (
                <option key={tank.id} value={tank.id}>
                  {tank.name} ({tank.code}) - Stock: {tank.current_stock}L
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Datos del Recibo */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr', 
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Serie del Recibo
            </label>
            <input
              type="text"
              name="receipt_series"
              className="form-control"
              value={formData.receipt_series}
              onChange={handleChange}
              placeholder="M1"
              maxLength="10"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Número del Recibo
            </label>
            <input
              type="text"
              name="receipt_number"
              className="form-control"
              value={formData.receipt_number}
              onChange={handleChange}
              placeholder="000348"
              maxLength="20"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>

        {/* Notas / Observaciones */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Notas / Observaciones {formData.type === 'ADJUSTMENT' && <span style={{ color: 'red' }}>*</span>}
          </label>
          <textarea
            name="notes"
            className="form-control"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder={formData.type === 'ADJUSTMENT' ? 'Explique el motivo del ajuste (obligatorio)' : 'Observaciones adicionales...'}
            required={formData.type === 'ADJUSTMENT'}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Botones */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb',
        }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: loading ? '#ccc' : '#3b82f6',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            {loading ? 'Procesando...' : '🔐 Validar y Registrar'}
          </button>
        </div>
      </form>

      {/* Modal de PIN */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingSubmit(false);
        }}
        onSuccess={handlePinSuccess}
        locationId={parseInt(formData.location_id)}
        title="Autorización de Movimiento"
      />
    </div>
  );
};

MovementForm.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  initialType: PropTypes.oneOf(['ENTRY', 'EXIT', 'TRANSFER', 'ADJUSTMENT']),
};

export default MovementForm;
