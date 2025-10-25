import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  FaBell, 
  FaThermometerHalf, 
  FaCloudRain, 
  FaWater,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCalendar,
  FaCircle,
  FaSync,
  FaSignOutAlt
} from 'react-icons/fa';
import { useSensor } from './context/SensorContext';
import { useAuth } from './context/AuthContext';
import config from './config/config';
import Login from './components/Login';
import logo from './img/logo2.png';

function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [currentTime, setCurrentTime] = useState('');
  
  const { isAuthenticated, login, logout, loading: authLoading } = useAuth();
  
  const { 
    sensoresActuales, 
    alertasActivas, 
    datosHistoricos,
    loading,
    wsConnected,
    marcarAlertaAtendida,
    recargarDatos,
    cargarDatosHistoricos
  } = useSensor();

  // Hook useEffect debe estar antes de los returns condicionales
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours > 12 ? hours - 12 : hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cargar datos históricos cuando se cambia a la pestaña de históricos
  useEffect(() => {
    if (activeTab === 'historicos' && cargarDatosHistoricos) {
      // Cargar datos iniciales
      cargarDatosHistoricos(60);

      // Actualizar cada minuto
      const interval = setInterval(() => {
        cargarDatosHistoricos(60);
      }, 60000); // 60000 ms = 1 minuto

      return () => clearInterval(interval);
    }
  }, [activeTab, cargarDatosHistoricos]);

  // Si aún está cargando la autenticación, mostrar pantalla de carga
  if (authLoading) {
    return (
      <div className="loading-container" style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <FaSync className="loading-icon" />
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  const getIntensidadPrecipitacion = (precipitacion) => {
    if (precipitacion >= 1000) return 'Critico';
    if (precipitacion >= 730) return 'Moderada';
    return 'Normal';
  };

  const getNivelCaudal = (caudal) => {
    if (caudal < config.THRESHOLDS.CAUDAL_NORMAL) return 'Bajo';
    if (caudal < config.THRESHOLDS.CAUDAL_CRITICO) return 'Normal';
    return 'Alto';
  };

  const renderStationsPage = () => {
    const sensoresArray = Object.values(sensoresActuales || {});

    if (loading) {
      return (
        <div className="stations-page">
          <div className="loading-container">
            <FaSync className="loading-icon" />
            <p>Cargando datos de estaciones...</p>
          </div>
        </div>
      );
    }

    // Si no hay sensores, mostrar mensaje
    if (sensoresArray.length === 0) {
      return (
        <div className="stations-page">
          <h1 className="stations-title">Monitoreo por Estaciones</h1>
          <div className="no-stations">No hay estaciones disponibles</div>
        </div>
      );
    }

    // Seleccionar la lectura más reciente entre todos los sensores (una sola estación visible)
    const latestSensor = sensoresArray.reduce((best, s) => {
      const bestTime = new Date(best.updatedAt || best.createdAt || best.timestamp || 0).getTime();
      const sTime = new Date(s.updatedAt || s.createdAt || s.timestamp || Date.now()).getTime();
      return sTime >= bestTime ? s : best;
    }, sensoresArray[0]);

    const sensor = latestSensor;
    const alertasNodo = alertasActivas.filter(a => a.estacion_id === sensor.estacion_id && a.activa);
    const alertaPrincipal = alertasNodo.find(a => a.tipo === 'critical') || alertasNodo[0];

    return (
      <div className="stations-page">
        <h1 className="stations-title">Monitoreo por Estación (actual)</h1>
        <div className="stations-grid single">
          <div key={sensor.estacion_id || sensor.device_name} className="station-card">
            <div className="station-header">
              <h3 className="station-name">{sensor.device_name || sensor.id}</h3>
              <div className="station-timestamp">{new Date(sensor.updatedAt || sensor.createdAt || sensor.timestamp || Date.now()).toLocaleString()}</div>
            </div>

            <div className="station-metrics">
              <div className="station-metric">
                <div className="metric-info">
                  <div className="metric-type">Temperatura y Humedad</div>
                  <div className="metric-main-value">
                    {sensor.temperatura?.toFixed(1) || 0}°C / {sensor.humedad || 0}%
                  </div>
                </div>
                <div className="metric-icon"><FaThermometerHalf /></div>
              </div>

              <div className="station-metric">
                <div className="metric-info">
                  <div className="metric-type">Precipitacion</div>
                  <div className={`metric-main-value ${
                    (sensor.precipitacion || 0) > config.THRESHOLDS.PRECIPITACION_ALTA ? 'critical' : 
                    (sensor.precipitacion || 0) > config.THRESHOLDS.PRECIPITACION_MODERADA ? 'warning' : ''
                  }`}>
                    {sensor.precipitacion?.toFixed(2) || 0}mm/h
                  </div>
                  <div className="metric-secondary">
                    Intensidad: {getIntensidadPrecipitacion(sensor.precipitacion || 0)}
                  </div>
                </div>
                <div className="metric-icon"><FaCloudRain /></div>
              </div>

              <div className="station-metric">
                <div className="metric-info">
                  <div className="metric-type">Caudal</div>
                  <div className={`metric-main-value ${
                    getNivelCaudal(sensor.caudal || 0) === 'Normal' ? 'normal' : 
                    getNivelCaudal(sensor.caudal || 0) === 'Bajo' ? '' : 'critical'
                  }`}>
                    {sensor.caudal?.toFixed(1) || 0} m³/s
                  </div>
                  <div className="metric-secondary">
                    Nivel: {getNivelCaudal(sensor.caudal || 0)}
                  </div>
                </div>
                <div className="metric-icon"><FaWater /></div>
              </div>
            </div>

            {alertaPrincipal && (
              <div className={`station-alert ${alertaPrincipal.tipo}`}>
                <div className="station-alert-icon">
                  {alertaPrincipal.tipo === 'warning' ? <FaExclamationTriangle /> : <FaExclamationCircle />}
                </div>
                <div className="station-alert-content">
                  <div className="station-alert-title">{alertaPrincipal.titulo}</div>
                  <div className="station-alert-description">{alertaPrincipal.descripcion}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Generate simple line chart path
  const generateChartPath = (data, width, height) => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const renderHistoricalPage = () => {
    // Verificar si hay datos históricos cargados
    if (!datosHistoricos) {
      return (
        <div className="historical-page">
          <div className="loading-container">
            <FaSync className="loading-icon" />
            <p>Cargando datos históricos...</p>
          </div>
        </div>
      );
    }

    // Procesar datos para las gráficas (últimos 20 registros en orden cronológico)
    const lecturas = datosHistoricos.lecturas || [];
    const lecturasOrdenadas = [...lecturas].reverse().slice(-20);
    
    // Extraer datos para las gráficas
    const tempData = lecturasOrdenadas.map(l => parseFloat(l.temperatura) || 0);
    const humidityData = lecturasOrdenadas.map(l => parseFloat(l.humedad) || 0);
    const rainData = lecturasOrdenadas.map(l => parseFloat(l.precipitacion) || 0);
    const flowData = lecturasOrdenadas.map(l => parseFloat(l.caudal) || 0);

    // Calcular valores actuales (promedio de los últimos registros)
    const promedios = datosHistoricos.promedios || { temperatura: 0, humedad: 0, precipitacion: 0, caudal: 0 };
    
    // Preparar registros para la tabla (últimos 20)
    const historicalRecords = lecturas.map(lectura => ({
      date: new Date(lectura.timestamp).toLocaleString('es-ES'),
      temp: parseFloat(lectura.temperatura).toFixed(1),
      humidity: parseFloat(lectura.humedad).toFixed(1),
      rain: parseFloat(lectura.precipitacion).toFixed(2),
      flow: parseFloat(lectura.caudal).toFixed(1),
      device: lectura.device_name
    }));

    return (
      <div className="historical-page">
        {/* Header with reload button */}
        <div className="historical-header">
          <h1 className="historical-title">Datos Históricos (Últimos 60 minutos)</h1>
          <div className="date-filters">
            <button 
              className="reload-button" 
              onClick={() => cargarDatosHistoricos(60)} 
              title="Recargar datos históricos"
            >
              <FaSync />
              <span style={{ marginLeft: '8px' }}>Actualizar</span>
            </button>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '10px' }}>
              Actualización automática cada minuto
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Temperature Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-label">Temperatura</div>
              <div className="chart-value">{promedios.temperatura}°C</div>
              <span className="chart-trend">Promedio últimos 60 min</span>
            </div>
            <div className="chart-container">
              {tempData.length > 1 ? (
                <svg className="chart-svg" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <path
                    d={generateChartPath(tempData, 300, 100)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '40px', color: '#9ca3af' }}>
                  Sin suficientes datos
                </div>
              )}
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-label">Humedad</div>
              <div className="chart-value">{promedios.humedad}%</div>
              <span className="chart-trend">Promedio últimos 60 min</span>
            </div>
            <div className="chart-container">
              {humidityData.length > 1 ? (
                <svg className="chart-svg" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <path
                    d={generateChartPath(humidityData, 300, 100)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '40px', color: '#9ca3af' }}>
                  Sin suficientes datos
                </div>
              )}
            </div>
          </div>

          {/* Rain Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-label">Precipitación</div>
              <div className="chart-value">{promedios.precipitacion} mm/h</div>
              <span className="chart-trend">Promedio últimos 60 min</span>
            </div>
            <div className="chart-container">
              {rainData.length > 1 ? (
                <svg className="chart-svg" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <path
                    d={generateChartPath(rainData, 300, 100)}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '40px', color: '#9ca3af' }}>
                  Sin suficientes datos
                </div>
              )}
            </div>
          </div>

          {/* Flow Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-label">Caudal</div>
              <div className="chart-value">{promedios.caudal} L/s</div>
              <span className="chart-trend">Promedio últimos 60 min</span>
            </div>
            <div className="chart-container">
              {flowData.length > 1 ? (
                <svg className="chart-svg" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <path
                    d={generateChartPath(flowData, 300, 100)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '40px', color: '#9ca3af' }}>
                  Sin suficientes datos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historical Records Table */}
        <div className="historical-table-section">
          <h2 className="table-title">Registros Históricos (Últimas 20 lecturas)</h2>
          {historicalRecords.length > 0 ? (
            <table className="historical-table">
              <thead>
                <tr>
                  <th>FECHA Y HORA</th>
                  <th>DISPOSITIVO</th>
                  <th>TEMPERATURA (°C)</th>
                  <th>HUMEDAD (%)</th>
                  <th>PRECIPITACIÓN (MM/H)</th>
                  <th>CAUDAL (L/s)</th>
                </tr>
              </thead>
              <tbody>
                {historicalRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.device}</td>
                    <td>{record.temp}</td>
                    <td>{record.humidity}</td>
                    <td>{record.rain}</td>
                    <td>{record.flow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-alerts">
              <p>No hay datos históricos disponibles</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const calcularPromedios = () => {
    const sensoresArray = Object.values(sensoresActuales);
    if (sensoresArray.length === 0) {
      return { temperatura: 0, humedad: 0, precipitacion: 0, caudal: 0 };
    }

    const sum = sensoresArray.reduce((acc, sensor) => ({
      temperatura: acc.temperatura + (sensor.temperatura || 0),
      humedad: acc.humedad + (sensor.humedad || 0),
      precipitacion: acc.precipitacion + (sensor.precipitacion || 0),
      caudal: acc.caudal + (sensor.caudal || 0)
    }), { temperatura: 0, humedad: 0, precipitacion: 0, caudal: 0 });

    return {
      temperatura: (sum.temperatura / sensoresArray.length).toFixed(1),
      humedad: Math.round(sum.humedad / sensoresArray.length),
      precipitacion: (sum.precipitacion / sensoresArray.length).toFixed(1),
      caudal: (sum.caudal / sensoresArray.length).toFixed(1)
    };
  };

  const renderMonitoreoPage = () => {
    const promedios = calcularPromedios();
    const alertasNoAtendidas = alertasActivas.filter(a => a.activa);

    if (loading) {
      return (
        <div className="loading-container">
          <FaSync className="loading-icon" />
          <p>Cargando datos del sistema...</p>
        </div>
      );
    }

    return (
      <>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Temperatura</div>
            <div className="metric-value">{promedios.temperatura}°C</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Humedad</div>
            <div className="metric-value">{promedios.humedad}%</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Precipitacion</div>
            <div className="metric-value">{promedios.precipitacion} mm</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Caudal</div>
            <div className="metric-value">{promedios.caudal} m³/s</div>
          </div>

          <div className="metric-card alerts">
            <div className="metric-label">Alertas</div>
            <div className="metric-value">{alertasNoAtendidas.length} Activas</div>
          </div>
        </div>

        <section className="alerts-section">
          <div className="alerts-header">
            <h2 className="alerts-title">Alertas Activas</h2>
            <button className="reload-button" onClick={recargarDatos} title="Recargar datos">
              <FaSync />
            </button>
          </div>
          
          {alertasNoAtendidas.length === 0 ? (
            <div className="no-alerts">
              <p>No hay alertas activas en este momento</p>
            </div>
          ) : (
            <div className="alert-list">
              {alertasNoAtendidas.map((alerta) => (
                <div key={alerta.id} className={`alert-item ${alerta.tipo}`}>
                  <div className="alert-icon">
                    {alerta.tipo === 'warning' ? <FaExclamationTriangle /> : <FaExclamationCircle />}
                  </div>
                  <div className="alert-content">
                    <h3 className="alert-title">{alerta.titulo}</h3>
                    <p className="alert-description">{alerta.descripcion}</p>
                    <div className="alert-footer">
                      <span className="alert-time">
                        {new Date(alerta.createdAt).toLocaleString('es-ES')}
                      </span>
                      <button 
                        className="alert-action-btn"
                        onClick={() => marcarAlertaAtendida(alerta.id)}
                      >
                        Marcar como atendida
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    );
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img src={logo} alt="Sistema de Alerta Temprana" className="logo-image" />
          </div>
          <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
            <FaCircle />
            <span>{wsConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveTab('inicio')}
          >
            Inicio
          </button>
          <button
            className={`tab ${activeTab === 'actuales' ? 'active' : ''}`}
            onClick={() => setActiveTab('actuales')}
          >
            Datos Actuales
          </button>
          <button
            className={`tab ${activeTab === 'historicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('historicos')}
          >
            Datos Históricos
          </button>
        </div>

        <div className="header-right">
          <div className="time">{currentTime}</div>
          <div className="notification-icon">
            <FaBell />
            {alertasActivas.filter(a => a.activa).length > 0 && (
              <span className="notification-badge">
                {alertasActivas.filter(a => a.activa).length}
              </span>
            )}
          </div>
          <button className="logout-button" onClick={logout} title="Cerrar sesión">
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'inicio' && renderMonitoreoPage()}
      {activeTab === 'actuales' && renderStationsPage()}
      {activeTab === 'historicos' && renderHistoricalPage()}
    </div>
  );
}

export default App;
