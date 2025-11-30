// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// IMPORTAR RUTAS
const authRoutes = require('./routes/auth');
const placeRoutes = require('./routes/places');
const polygonRoutes = require('./routes/polygons');
const changeLogRoutes = require('./routes/changeLogs');

// MIDDLEWARES
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io available in routes
app.set('io', io);

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// RUTAS API
app.use('/auth', authRoutes);
app.use('/places', placeRoutes);
app.use('/polygons', polygonRoutes);
app.use('/logs', changeLogRoutes);
app.use('/clients', require('./routes/clients'));
app.use('/deliveries', require('./routes/deliveries'));
app.use('/drivers', require('./routes/drivers'));

// SERVIR FRONTEND REACT EN PRODUCCIÓN
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos del build de React
  app.use(express.static(path.join(__dirname, 'client', 'dist')));

  // Todas las rutas no-API redirigen al index.html de React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  // En desarrollo, servir la carpeta public original
  app.use(express.static('public'));
}

// ERROR HANDLING
app.use(errorHandler.logErrors);
app.use(errorHandler.errorHandler);

// SOCKET.IO
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('updateLocation', async (data) => {
    io.emit('driverLocationUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// CONEXIÓN A MONGODB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alanfx3:Keeper2003117@cluster25712.lslbiye.mongodb.net/?retryWrites=true&w=majority&appName=cluster25712';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// LEVANTAR SERVIDOR
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
