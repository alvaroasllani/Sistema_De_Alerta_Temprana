import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import websocketService from '../services/websocket';

const SensorContext = createContext();

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensor debe ser usado dentro de un SensorProvider');
  }
  return context;
};

export const SensorProvider = ({ children }) => {
  const [sensoresActuales, setSensoresActuales] = useState({});
  const [alertasActivas, setAlertasActivas] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setLoading(true);
      const [sensores, alertas, estacionesData] = await Promise.all([
        apiService.getSensoresActuales(),
        apiService.getAlertasActivas(),
        apiService.getEstaciones()
      ]);
      setSensoresActuales(sensores);
      setAlertasActivas(alertas);
      setEstaciones(estacionesData);
      setUltimaActualizacion(new Date());
      setError(null);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
      setError('Error al cargar los datos del sistema');
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarSensorData = useCallback((data) => {
    data.temperatura = Number(data.temperatura);
    data.humedad = Number(data.humedad);
    data.caudal = Number(data.caudal);
    data.lluvia = Number(data.lluvia);

    setSensoresActuales(prev => ({
      ...prev,
      [data.id]: {
        ...prev[data.id],
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      }
    }));
    setUltimaActualizacion(new Date());
  }, []);

  const agregarAlerta = useCallback((alerta) => {
    setAlertasActivas(prev => {
      const existe = prev.find(a => a.id === alerta.id);
      if (existe) {
        return prev.map(a => a.id === alerta.id ? alerta : a);
      }
      return [alerta, ...prev];
    });

    if (alerta.tipo === 'critical') {
      reproducirSonidoAlerta();
    }
    
    mostrarNotificacion(alerta);
  }, []);

  const marcarAlertaAtendida = useCallback(async (alertaId) => {
    try {
      await apiService.marcarAlertaAtendida(alertaId);
      setAlertasActivas(prev => 
        prev.map(alerta => 
          alerta.id === alertaId 
            ? { ...alerta, atendida: true } 
            : alerta
        )
      );
    } catch (err) {
      console.error('Error marcando alerta como atendida:', err);
    }
  }, []);

  const reproducirSonidoAlerta = () => {
    if ('Audio' in window) {
      const audio = new Audio('/sounds/alert.mp3');
      audio.play().catch(err => console.log('No se pudo reproducir sonido:', err));
    }
  };

  const mostrarNotificacion = (alerta) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alerta.titulo, {
        body: alerta.descripcion,
        icon: '/logo192.png',
        tag: alerta.id
      });
    }
  };

  const solicitarPermisosNotificacion = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    cargarDatosIniciales();
    solicitarPermisosNotificacion();

    websocketService.connect();

    const unsubscribeSensor = websocketService.onSensorData(actualizarSensorData);
    const unsubscribeAlert = websocketService.onAlert(agregarAlerta);
    const unsubscribeConnect = websocketService.onConnect(() => {
      setWsConnected(true);
      console.log('Conectado al servidor WebSocket');
    });
    const unsubscribeDisconnect = websocketService.onDisconnect(() => {
      setWsConnected(false);
      console.log('Desconectado del servidor WebSocket');
    });

    return () => {
      unsubscribeSensor();
      unsubscribeAlert();
      unsubscribeConnect();
      unsubscribeDisconnect();
      websocketService.disconnect();
    };
  }, [cargarDatosIniciales, actualizarSensorData, agregarAlerta, solicitarPermisosNotificacion]);

  const value = {
    sensoresActuales,
    alertasActivas,
    estaciones,
    loading,
    error,
    wsConnected,
    ultimaActualizacion,
    marcarAlertaAtendida,
    recargarDatos: cargarDatosIniciales
  };

  return (
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
};

export default SensorContext;

