const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const sensor = require('./routes/sensores.js');

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

  const interval_1 = setInterval(() => {
    const data = {
      id: 'esp32-01',
      temperatura: (Math.random() * 5 + 20),
      humedad: Math.round(Math.random() * 20 + 60),
      lluvia: (Math.random() * 10),
      caudal: (Math.random() * 2)
    };
    if (socket.connected) socket.emit('sensor:data', data);
  }, 5000);

  const interval_2 = setInterval(() => {
    const data = {
      id: 'esp32-02',
      temperatura: (Math.random() * 5 + 20),
      humedad: Math.round(Math.random() * 20 + 60),
      lluvia: (Math.random() * 10),
      caudal: (Math.random() * 2)
    };
    if (socket.connected) socket.emit('sensor:data', data);
  }, 5000);

  socket.on('disconnect', () => {
    clearInterval(interval_1);
    clearInterval(interval_2);
    console.log('Socket client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});