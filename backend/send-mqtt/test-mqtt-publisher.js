const mqtt = require('mqtt');

// MQTT Configuration
const MQTT_BROKER = 'localhost';
const MQTT_PORT = 1883;
const MQTT_TOPIC = 'agro/datos';

// Connect to MQTT broker
const client = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

client.on('connect', () => {
  console.log('Conectado al broker MQTT Mosquitto!');
  
  // Publish sensor data every 5 seconds
  setInterval(() => {
    const sensorData = {
      temp: (Math.random() * 10 + 20).toFixed(2),
      humedad: (Math.random() * 20 + 60).toFixed(2),
      precipitacion: (Math.random() * 10).toFixed(2),
      caudal: (Math.random() * 2).toFixed(2),
      presion: (Math.random() * 5 + 10).toFixed(2)
    };
    
    const jsonPayload = JSON.stringify(sensorData);
    client.publish(MQTT_TOPIC, jsonPayload);
    console.log(`Publicado en ${MQTT_TOPIC}:`, sensorData);
  }, 5000);
});

client.on('error', (err) => {
  console.error('Error de conexión MQTT:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Desconectando del broker MQTT...');
  client.end();
  process.exit(0);
});
