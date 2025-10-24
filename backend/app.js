const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const sensor = require('./routes/sensores.js');

const { lecturas } = require('./models');
const { emitirAlertaSiCorresponde, insertReading } = require('./db');

// MQTT Configuration
const MQTT_BROKER = 'localhost';
const MQTT_PORT = 1883;
const MQTT_TOPICS = [
  'agro/datos'
];

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', sensor);

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: 'http://localhost:3000' } 
});

// MQTT Client Setup
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

mqttClient.on('connect', () => {
  console.log('Conectado al broker MQTT Mosquitto!');
  
  // Subscribe to all MQTT topics
  MQTT_TOPICS.forEach(topic => {
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Error suscribiéndose al tópico ${topic}:`, err);
      } else {
        console.log(`Suscrito al tópico: ${topic}`);
      }
    });
  });
});

mqttClient.on('error', (err) => {
  console.error('Error de conexión MQTT:', err);
});

mqttClient.on('message', async (topic, message) => {
  try {
    const payload = message.toString();
    console.log(`Mensaje MQTT recibido en ${topic}: ${payload}`);
    
    // Parse JSON payload
    let data;
    try {
      data = JSON.parse(payload);
    } catch (parseError) {
      console.error('Error parseando JSON:', parseError);
      return;
    }
    
    // Create sensor data object based on topic
    let sensorData = {
      device_id: 'esp32-01',
      estacion_id: 1,
      temperatura: parseFloat(data.temp) || 0,
      humedad: parseFloat(data.humedad) || 0,
      lluvia: parseFloat(data.precipitacion) || 0,
      caudal: parseFloat(data.caudal) || 0,
      presion: parseFloat(data.presion) || 0
    };
    
    // Emit data to all connected clients
    io.emit('sensor:data', sensorData);
    
    // Save reading to database
    try {
      const lectura = await insertReading(sensorData);
      // Evaluate if alerts should be generated
      const alertasEmitidas = await emitirAlertaSiCorresponde(lectura);
      
      // If there are new alerts, emit them via socket
      if (alertasEmitidas && alertasEmitidas.length > 0) {
        io.emit('alertas:nueva', alertasEmitidas);
      }
    } catch (dbError) {
      console.error('Error guardando lectura en base de datos:', dbError);
    }
    
  } catch (error) {
    console.error('Error procesando mensaje MQTT:', error);
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Cerrando conexiones...');
  mqttClient.end();
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});