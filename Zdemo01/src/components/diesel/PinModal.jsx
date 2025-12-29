import { useState } from 'react';
import PropTypes from 'prop-types';
import { getPersonal } from '../../services/dieselService';

/**
 * Modal de Validación de PIN
 * 
 * Componente reutilizable que solicita PIN de seguridad
 * antes de ejecutar operaciones críticas
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función que se ejecuta al validar exitosamente el PIN
 * @param {number} props.locationId - ID de la ubicación donde se operará
 * @param {string} props.title - Título del modal
 */
const PinModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  locationId, 
  title = 'Autorización Requerida' 
}) => {
  const [selectedPersonal, setSelectedPersonal] = useState('');
  const [personalList, setPersonalList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar lista de personal cuando se abre el modal
  useState(() => {
    if (isOpen) {
      loadPersonal();
    }
  }, [isOpen]);

  const loadPersonal = async () => {
    try {
      setLoading(true);
      const response = await getPersonal({ estado: 'activo' });
      setPersonalList(response.data || []);
    } catch (err) {
      setError('Error al cargar el personal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPersonal) {
      setError('Debe seleccionar un personal para autorizar');
      return;
    }

    // Ejecutar la función de éxito pasando el ID del personal
    onSuccess(parseInt(selectedPersonal));
    handleClose();
  };

  const handleClose = () => {
    setSelectedPersonal('');
    setError('');
    setSearchTerm('');
    onClose();
  };

  // Filtrar personal por búsqueda
  const filteredPersonal = personalList.filter(person => {
    const fullName = `${person.nombre} ${person.apellido_paterno} ${person.apellido_materno}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || person.ci?.includes(searchTerm);
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="modal-overlay" 
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {/* Modal */}
        <div 
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              🔐 {title}
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Seleccione el personal que autoriza esta operación
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Búsqueda */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="search" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Buscar Personal
              </label>
              <input
                id="search"
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o CI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Select de Personal */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="personal" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Personal Autorizado <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                id="personal"
                className="form-control"
                value={selectedPersonal}
                onChange={(e) => setSelectedPersonal(e.target.value)}
                required
                disabled={loading}
                size="6"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                <option value="">-- Seleccione un personal --</option>
                {filteredPersonal.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.nombre} {person.apellido_paterno} {person.apellido_materno}
                    {person.ci && ` (CI: ${person.ci})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Info sobre ubicación */}
            {locationId && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}>
                <strong>ℹ️ Nota:</strong> El personal seleccionado debe tener permisos 
                para operar en esta ubicación.
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                marginBottom: '1rem',
                color: '#dc2626',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            {/* Botones */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end',
              marginTop: '1.5rem',
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !selectedPersonal}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: loading || !selectedPersonal ? '#ccc' : '#3b82f6',
                  color: 'white',
                  cursor: loading || !selectedPersonal ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                }}
              >
                {loading ? 'Cargando...' : 'Autorizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

PinModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  locationId: PropTypes.number,
  title: PropTypes.string,
};

export default PinModal;
