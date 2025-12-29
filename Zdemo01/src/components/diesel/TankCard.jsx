import PropTypes from 'prop-types';

/**
 * Tarjeta de Tanque de Diesel
 * 
 * Muestra visualmente el estado de un tanque con:
 * - Nombre y código
 * - Capacidad total
 * - Stock actual
 * - Barra de nivel visual
 * - Porcentaje
 * 
 * @param {Object} props
 * @param {Object} props.tank - Datos del tanque
 * @param {Function} props.onClick - Función al hacer clic en la tarjeta
 */
const TankCard = ({ tank, onClick }) => {
  const {
    id,
    name,
    code,
    type,
    capacity,
    current_stock,
    stock_percentage,
    location,
    current_meter,
  } = tank;

  // Determinar color según el nivel
  const getColorByPercentage = (percentage) => {
    if (percentage >= 70) return '#10b981'; // Verde
    if (percentage >= 40) return '#f59e0b'; // Amarillo
    if (percentage >= 20) return '#ef4444'; // Rojo
    return '#dc2626'; // Rojo oscuro
  };

  const color = getColorByPercentage(stock_percentage);

  // Determinar icono según el tipo
  const getIcon = (type) => {
    if (type === 'FIXED') return '🛢️';
    if (type === 'MOBILE') return '🚚';
    return '📦';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(tank);
    }
  };

  return (
    <div 
      className="tank-card"
      onClick={handleClick}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        backgroundColor: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>{getIcon(type)}</span>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.125rem', 
              fontWeight: 'bold',
              color: '#1f2937',
            }}>
              {name}
            </h3>
            {code && (
              <p style={{ 
                margin: 0, 
                fontSize: '0.875rem', 
                color: '#6b7280',
              }}>
                {code}
              </p>
            )}
          </div>
        </div>
        
        {/* Badge del tipo */}
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          backgroundColor: type === 'FIXED' ? '#dbeafe' : '#fef3c7',
          color: type === 'FIXED' ? '#1e40af' : '#92400e',
        }}>
          {type === 'FIXED' ? 'Fijo' : 'Móvil'}
        </span>
      </div>

      {/* Ubicación */}
      {location && (
        <div style={{ 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}>
          <span>📍</span>
          <span>{location.name}</span>
        </div>
      )}

      {/* Barra de nivel visual */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
        }}>
          <span style={{ fontWeight: '500', color: '#374151' }}>
            Nivel Actual
          </span>
          <span style={{ fontWeight: 'bold', color }}>
            {stock_percentage.toFixed(1)}%
          </span>
        </div>
        
        {/* Barra de progreso */}
        <div style={{
          width: '100%',
          height: '24px',
          backgroundColor: '#f3f4f6',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{
            width: `${stock_percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}>
            {stock_percentage > 10 && `${stock_percentage.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {/* Información de capacidad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontSize: '0.875rem',
      }}>
        <div>
          <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
            Stock Actual
          </div>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '1.125rem',
            color: '#1f2937',
          }}>
            {parseFloat(current_stock).toLocaleString('es-BO', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} L
          </div>
        </div>
        
        <div>
          <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
            Capacidad
          </div>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '1.125rem',
            color: '#1f2937',
          }}>
            {parseFloat(capacity).toLocaleString('es-BO', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} L
          </div>
        </div>
      </div>

      {/* Medidor actual */}
      {current_meter !== null && current_meter !== undefined && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '6px',
          fontSize: '0.875rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#0369a1', fontWeight: '500' }}>
            Medidor Actual
          </span>
          <span style={{ fontWeight: 'bold', color: '#0c4a6e' }}>
            {parseFloat(current_meter).toLocaleString('es-BO', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      )}

      {/* Alerta de stock bajo */}
      {stock_percentage < 20 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>⚠️</span>
          <span style={{ fontWeight: '500' }}>Stock Bajo</span>
        </div>
      )}
    </div>
  );
};

TankCard.propTypes = {
  tank: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string,
    type: PropTypes.oneOf(['FIXED', 'MOBILE']).isRequired,
    capacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    current_stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    stock_percentage: PropTypes.number.isRequired,
    current_meter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    location: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }).isRequired,
  onClick: PropTypes.func,
};

export default TankCard;
