// app.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// IMPORTAR RUTAS
const authRoutes = require('./routes/auth');
const placeRoutes = require('./routes/places');
const polygonRoutes = require('./routes/polygons');
const changeLogRoutes = require('./routes/changeLogs');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public')); // sirve login.html, index.html, etc.

// RUTAS
app.use('/auth', authRoutes);       // /auth/login  -  /auth/register
app.use('/places', placeRoutes);   // CRUD lugares
app.use('/polygons', polygonRoutes);
app.use('/logs', changeLogRoutes);

// ⚠️ CONEXIÓN DIRECTA A MONGO (SIN .env, SIN process.env)
mongoose
  .connect(
    'mongodb+srv://alanfx3:Keeper2003117@cluster25712.lslbiye.mongodb.net/?retryWrites=true&w=majority&appName=cluster25712'
  )
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// LEVANTAR SERVIDOR
app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});