# MQTT Integration para Sistema de Alerta Temprana

## Instalación Completada

✅ **Librería MQTT instalada**: Se instaló el paquete `mqtt` para Node.js

## Cambios Realizados

### 1. Integración MQTT en `app.js`

Se integró la funcionalidad MQTT directamente en el servidor principal:

- **Conexión MQTT**: Se conecta automáticamente al broker Mosquitto en `localhost:1883`
- **Suscripción a tópicos**:
  - `casa/habitacion1/temperatura` → Estación 1 (esp32-01)
  - `case/cocina/temperatura` → Estación 2 (esp32-02)
- **Procesamiento de datos**: Los datos MQTT se procesan y se integran con el sistema existente
- **Base de datos**: Los datos recibidos se guardan automáticamente en la base de datos
- **Alertas**: Se evalúan las condiciones para generar alertas automáticamente
- **Socket.IO**: Los datos se emiten en tiempo real a los clientes conectados

### 2. Script de Prueba

Se creó `test-mqtt-publisher.js` para probar la integración:

```bash
# Ejecutar el publisher de prueba
node backend/send-mqtt/test-mqtt-publisher.js
```

## Cómo Usar

### 1. Iniciar el Servidor Principal

```bash
cd backend
node app.js
```

El servidor ahora:
- Se conecta automáticamente al broker MQTT
- Escucha los tópicos configurados
- Procesa los datos recibidos
- Los guarda en la base de datos
- Los emite via Socket.IO

### 2. Probar con Datos Simulados

```bash
# En otra terminal, ejecutar el publisher de prueba
node backend/send-mqtt/test-mqtt-publisher.js
```

### 3. Usar con Dispositivos Reales

Los dispositivos ESP32 pueden publicar datos directamente a los tópicos:
- `casa/habitacion1/temperatura` → Temperatura de la habitación
- `case/cocina/temperatura` → Temperatura de la cocina

## Configuración

Los parámetros MQTT están configurados en `app.js`:

```javascript
const MQTT_BROKER = 'localhost';
const MQTT_PORT = 1883;
const MQTT_TOPICS = [
  'casa/habitacion1/temperatura',
  'case/cocina/temperatura'
];
```

## Ventajas de la Nueva Implementación

1. **Integración completa**: MQTT está integrado directamente en el servidor principal
2. **Base de datos**: Los datos MQTT se guardan automáticamente
3. **Alertas automáticas**: Se evalúan condiciones y se generan alertas
4. **Tiempo real**: Los datos se emiten inmediatamente via Socket.IO
5. **Escalabilidad**: Fácil agregar nuevos tópicos y dispositivos
6. **Manejo de errores**: Incluye manejo robusto de errores de conexión

## Notas Importantes

- Asegúrate de que Mosquitto esté ejecutándose en `localhost:1883`
- Los datos MQTT reemplazan los datos simulados cuando están disponibles
- El sistema mantiene compatibilidad con el código existente
- Se incluye manejo graceful de desconexión
