const mqtt = require('mqtt');

const MQTT_BROKER = 'localhost';
const MQTT_PORT = 1883;
const MQTT_TOPIC = 'agro/datos';

const client = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

client.on('connect', () => {
  console.log(' Conectado al broker MQTT');
  console.log(' Enviando datos de prueba...\n');
  
  // Caso 1: Datos normales (sin alertas)
  console.log('1️⃣ Enviando datos NORMALES (sin alertas)...');
  const datosNormales = {
    temp: 22.5,
    humedad: 65.0,
    caudal: 3.2,
    precipitacion: 500.0
  };
  client.publish(MQTT_TOPIC, JSON.stringify(datosNormales));
  console.log('   Datos:', datosNormales);
  console.log('   No deberían generarse alertas\n');

  // Caso 2: Alerta WARNING por caudal moderado
  setTimeout(() => {
    console.log('2 Enviando datos con CAUDAL MODERADO (WARNING)...');
    const caudalModerado = {
      temp: 23.0,
      humedad: 68.0,
      caudal: 5.3,  // >= 5.1 → WARNING
      precipitacion: 600.0
    };
    client.publish(MQTT_TOPIC, JSON.stringify(caudalModerado));
    console.log('   Datos:', caudalModerado);
    console.log('  Debería generar alerta: "Caudal con nivel: Moderado"\n');
  }, 2000);

  // Caso 3: Alerta CRITICAL por caudal crítico
  setTimeout(() => {
    console.log('3 Enviando datos con CAUDAL CRÍTICO...');
    const caudalCritico = {
      temp: 24.0,
      humedad: 70.0,
      caudal: 6.5,  // >= 5.8 → CRITICAL
      precipitacion: 650.0
    };
    client.publish(MQTT_TOPIC, JSON.stringify(caudalCritico));
    console.log('   Datos:', caudalCritico);
    console.log('   Debería generar alerta: "Caudal con nivel: Critico"\n');
  }, 4000);

  // Caso 4: Alerta WARNING por precipitación moderada
  setTimeout(() => {
    console.log('4 Enviando datos con PRECIPITACIÓN MODERADA (WARNING)...');
    const precipitacionModerada = {
      temp: 21.0,
      humedad: 75.0,
      caudal: 4.0,
      precipitacion: 850.0  // >= 730 → WARNING
    };
    client.publish(MQTT_TOPIC, JSON.stringify(precipitacionModerada));
    console.log('   Datos:', precipitacionModerada);
    console.log('   Debería generar alerta: "Precipitacion con nivel: Moderado"\n');
  }, 6000);

  // Caso 5: Alerta CRITICAL por precipitación crítica
  setTimeout(() => {
    console.log('5Enviando datos con PRECIPITACIÓN CRÍTICA...');
    const precipitacionCritica = {
      temp: 20.0,
      humedad: 80.0,
      caudal: 4.5,
      precipitacion: 1200.0  // >= 1000 → CRITICAL
    };
    client.publish(MQTT_TOPIC, JSON.stringify(precipitacionCritica));
    console.log('   Datos:', precipitacionCritica);
    console.log('    Debería generar alerta: "Precipitacion con nivel: Critico"\n');
  }, 8000);

  // Caso 6: Múltiples alertas (caudal y precipitación)
  setTimeout(() => {
    console.log('6 Enviando datos con MÚLTIPLES ALERTAS...');
    const multipleAlertas = {
      temp: 25.0,
      humedad: 85.0,
      caudal: 6.0,        // >= 5.8 → CRITICAL
      precipitacion: 1500.0  // >= 1000 → CRITICAL
    };
    client.publish(MQTT_TOPIC, JSON.stringify(multipleAlertas));
    console.log('   Datos:', multipleAlertas);
    console.log('    Deberían generar 2 alertas CRÍTICAS\n');
  }, 10000);

  // Cerrar después de todas las pruebas
  setTimeout(() => {
    console.log('\n Pruebas completadas. Cerrando conexión...');
    client.end();
    process.exit(0);
  }, 12000);
});

client.on('error', (error) => {
  console.error(' Error de conexión MQTT:', error);
  process.exit(1);
});
