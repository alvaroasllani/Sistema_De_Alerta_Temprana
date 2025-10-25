import axios from 'axios';
import config from '../config/config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const apiService = {
  getSensoresActuales: async () => {
    try {
      const response = await api.get('/lecturas/actuales');
      // Normalizar datossensoresActuales
      const payload = response.data.reduce((acc, red) => {
        acc[red.id] = {
          id: red.id,
          estacion_id: red.estacion_id,
          device_name: red.device_name,
          humedad : Number(red.humedad),
          caudal: Number(red.caudal),
          precipitacion: Number(red.precipitacion),
          temperatura: Number(red.temperatura),
          timestamp: red.timestamp
        };
        return acc;
      }, {});
      return payload; 
    } catch (error) {
      console.error('Error obteniendo datos actuales:', error);
      throw error;
    }
  },

  getHistorialSensor: async (sensorId, fechaInicio, fechaFin) => {
    try {
      const response = await api.get(`/sensores/${sensorId}/historial`, {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  },

  getHistorialGeneral: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get('/sensores/historial', {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial general:', error);
      throw error;
    }
  },

  getAlertasActivas: async () => {
    try {
      const response = await api.get('/alertas/activas');
      const payload = response.data;
      return payload && payload.data !== undefined ? payload.data : payload;
    } catch (error) {
      console.error('Error obteniendo alertas activas:', error);
      throw error;
    }
  },

  getHistorialAlertas: async (limit = 50) => {
    try {
      const response = await api.get('/alertas/historial', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial de alertas:', error);
      throw error;
    }
  },

  marcarAlertaAtendida: async (alertaId) => {
    try {
      const response = await api.put(`/alertas/${alertaId}/atender`);
      return response.data;
    } catch (error) {
      console.error('Error marcando alerta como atendida:', error);
      throw error;
    }
  },

  getEstaciones: async () => {
    try {
      const response = await api.get('/estaciones');
      const payload = response.data;
      return payload && payload.data !== undefined ? payload.data : payload;
    } catch (error) {
      console.error('Error obteniendo estaciones:', error);
      throw error;
    }
  },

  getEstadisticas: async (periodo = '7d') => {
    try {
      const response = await api.get('/estadisticas', {
        params: { periodo }
      });
      const payload = response.data;
      return payload && payload.data !== undefined ? payload.data : payload;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  actualizarUmbrales: async (umbrales) => {
    try {
      const response = await api.put('/configuracion/umbrales', umbrales);
      return response.data;
    } catch (error) {
      console.error('Error actualizando umbrales:', error);
      throw error;
    }
  },

  getDatosHistoricos: async (minutos = 60, deviceName = null) => {
    try {
      const params = { minutos };
      if (deviceName) {
        params.device_name = deviceName;
      }
      const response = await api.get('/historicos', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo datos históricos:', error);
      throw error;
    }
  },

  getEstadisticasHistoricas: async (minutos = 60) => {
    try {
      const response = await api.get('/estadisticas/historicas', {
        params: { minutos }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas históricas:', error);
      throw error;
    }
  }
};

export default apiService;

