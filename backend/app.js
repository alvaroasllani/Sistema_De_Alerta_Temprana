const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const sensor = require('./routes/sensores.js');

const { lecturas } = require('./models');
const { emitirAlertaSiCorresponde } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', sensor);

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: 'http://localhost:3000' } 
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  const estaciones = [
    {
      id: 1,
      codigo: "esp32-01",
      nombre: "Estacion 1",
      ubicacion: "Cualquier Punto",
      latitud: "122.650000",
      longitud: "232.780000",
      createdAt: "2025-10-21T05:05:29.000Z",
      updatedAt: "2025-10-21T05:05:29.000Z"
    },
    {
      id: 2,
      codigo: "esp32-02",
      nombre: "Estacion 2",
      ubicacion: "Cualquier Punto",
      latitud: "932.650000",
      longitud: "132.780000",
      createdAt: "2025-10-21T05:05:29.000Z",
      updatedAt: "2025-10-21T05:05:29.000Z"
    }
  ];

  estaciones.forEach((est) => {
    const interval = setInterval(async () => {
      const data = {
        device_id: est.codigo,
        estacion_id: est.id,
        temperatura: (Math.random() * 5 + 20).toFixed(2),
        humedad: Math.round(Math.random() * 20 + 60),
        lluvia: (Math.random() * 10).toFixed(2),
        caudal: (Math.random() * 2).toFixed(2),
        presion: (Math.random() * 5 + 1005).toFixed(2)
      };

      // Emitir lectura al cliente
      if (socket.connected) socket.emit('sensor:data', data);

      // Guardar lectura en la base de datos
      try {
        const lectura = await lecturas.create(data);
        // 3️⃣ Evaluar si debe generarse una alerta
        const alertasEmitidas = await emitirAlertaSiCorresponde(nuevaLectura);

        // 4️⃣ Si hay nuevas alertas, emitirlas también por socket
        if (alertasEmitidas && alertasEmitidas.length > 0) {
          io.emit('alertas:nueva', alertasEmitidas);
        }
      } catch (error) {
        
      }
    }, 5000);
    
    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Cliente desconectado:', socket.id);
    });
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});