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
      const response = await api.get('/sensores/actuales');
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
  }
};

export default apiService;

