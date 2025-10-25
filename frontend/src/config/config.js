const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  WEBSOCKET_URL: process.env.REACT_APP_WS_URL || 'http://localhost:3001',
  MQTT_TOPIC: 'taquina/sensores/#',
  
  THRESHOLDS: {
    CAUDAL_CRITICO: 120,
    CAUDAL_NORMAL: 100,
    HUMEDAD_ALTA: 85,
    HUMEDAD_NORMAL: 70,
    TEMPERATURA_ALTA: 30,
    TEMPERATURA_BAJA: 10,
    LLUVIA_ALTA: 5,
    PRECIPITACION_ALTA: 1000,
    PRECIPITACION_MODERADA: 730
  },

  ALERT_TYPES: {
    CRITICA: 'critical',
    PRECAUCION: 'warning',
    INFO: 'info'
  },

  UPDATE_INTERVAL: 5000,
  CHART_DATA_POINTS: 20
};

export default config;

