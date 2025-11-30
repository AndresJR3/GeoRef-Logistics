import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { placesService } from '../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await placesService.getAllHistory();
      setHistory(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return '#22c55e';
      case 'update':
        return '#3b82f6';
      case 'delete':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'create':
        return 'Creado';
      case 'update':
        return 'Actualizado';
      case 'delete':
        return 'Eliminado';
      default:
        return action;
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Historial de Cambios</h1>
        <Link to="/" className="btn-back">
          <i className="ri-arrow-left-line"></i>
          Volver al mapa
        </Link>
      </div>

      {loading ? (
        <div className="history-loading">Cargando historial...</div>
      ) : error ? (
        <div className="history-error">{error}</div>
      ) : history.length === 0 ? (
        <div className="history-empty">No hay cambios registrados</div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Lugar</th>
                <th>Cambios</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log._id}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td>
                    <span
                      className="action-badge"
                      style={{ background: getActionColor(log.action) }}
                    >
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td>{log.placeId?.name || 'Lugar eliminado'}</td>
                  <td>
                    {log.changes?.length > 0 ? (
                      <ul className="changes-list">
                        {log.changes.map((change, idx) => (
                          <li key={idx}>
                            <strong>{change.field}:</strong>{' '}
                            {change.oldValue || '(vacío)'} → {change.newValue || '(vacío)'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
