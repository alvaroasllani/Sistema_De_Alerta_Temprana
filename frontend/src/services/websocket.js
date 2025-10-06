import { io } from 'socket.io-client';
import config from '../config/config';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = {
      onSensorData: [],
      onAlert: [],
      onConnect: [],
      onDisconnect: [],
      onError: []
    };
  }

  connect() {
    if (this.socket && this.connected) {
      console.log('WebSocket ya está conectado');
      return;
    }

    this.socket = io(config.WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      this.connected = true;
      this.listeners.onConnect.forEach(callback => callback());
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      this.connected = false;
      this.listeners.onDisconnect.forEach(callback => callback());
    });

    this.socket.on('sensor:data', (data) => {
      this.listeners.onSensorData.forEach(callback => callback(data));
    });

    this.socket.on('alert:new', (alert) => {
      this.listeners.onAlert.forEach(callback => callback(alert));
    });

    this.socket.on('alert:updated', (alert) => {
      this.listeners.onAlert.forEach(callback => callback(alert));
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.listeners.onError.forEach(callback => callback(error));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  onSensorData(callback) {
    this.listeners.onSensorData.push(callback);
    return () => {
      this.listeners.onSensorData = this.listeners.onSensorData.filter(cb => cb !== callback);
    };
  }

  onAlert(callback) {
    this.listeners.onAlert.push(callback);
    return () => {
      this.listeners.onAlert = this.listeners.onAlert.filter(cb => cb !== callback);
    };
  }

  onConnect(callback) {
    this.listeners.onConnect.push(callback);
    return () => {
      this.listeners.onConnect = this.listeners.onConnect.filter(cb => cb !== callback);
    };
  }

  onDisconnect(callback) {
    this.listeners.onDisconnect.push(callback);
    return () => {
      this.listeners.onDisconnect = this.listeners.onDisconnect.filter(cb => cb !== callback);
    };
  }

  onError(callback) {
    this.listeners.onError.push(callback);
    return () => {
      this.listeners.onError = this.listeners.onError.filter(cb => cb !== callback);
    };
  }

  isConnected() {
    return this.connected;
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket no está conectado. No se puede emitir el evento:', event);
    }
  }
}

const websocketService = new WebSocketService();

export default websocketService;

