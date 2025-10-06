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
      
      cargarDatosMock();
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDatosMock = () => {
    setSensoresActuales({
      nodo1: {
        id: 'nodo1',
        nombre: 'Estación 1',
        caudal: 120,
        humedad: 65,
        temperatura: 22,
        lluvia: 5,
        timestamp: new Date().toISOString()
      },
      nodo2: {
        id: 'nodo2',
        nombre: 'Estación 2',
        caudal: 110,
        humedad: 70,
        temperatura: 20,
        lluvia: 2,
        timestamp: new Date().toISOString()
      },
      nodo3: {
        id: 'nodo3',
        nombre: 'Estación 3',
        caudal: 95,
        humedad: 60,
        temperatura: 24,
        lluvia: 0,
        timestamp: new Date().toISOString()
      }
    });

    setEstaciones([
      { id: 'nodo1', nombre: 'Estación 1', lat: -17.3935, lng: -66.1570 },
      { id: 'nodo2', nombre: 'Estación 2', lat: -17.3945, lng: -66.1580 },
      { id: 'nodo3', nombre: 'Estación 3', lat: -17.3955, lng: -66.1590 }
    ]);

    setAlertasActivas([
      {
        id: 1,
        tipo: 'warning',
        titulo: 'Precaución: Alta Probabilidad de Lluvia',
        descripcion: 'Se esperan lluvias moderadas en las próximas 24 horas. Tome las precauciones necesarias.',
        nodoId: 'nodo1',
        timestamp: new Date().toISOString(),
        atendida: false
      },
      {
        id: 2,
        tipo: 'critical',
        titulo: 'Alerta Crítica: Caudal del Río Supera el Umbral',
        descripcion: 'El caudal del río ha superado los niveles críticos. Se requiere acción inmediata.',
        nodoId: 'nodo1',
        timestamp: new Date().toISOString(),
        atendida: false
      }
    ]);
  };

  const actualizarSensorData = useCallback((data) => {
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

