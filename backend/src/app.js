const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '../../frontend')));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/v1/auth', authRoutes);

const articuloRoutes = require('./routes/articuloRoutes');
app.use('/api/v1/articulos', articuloRoutes);

const categoriaRoutes = require('./routes/categoriaRoutes');
app.use('/api/v1/categorias', categoriaRoutes);

const incidenciaRoutes = require('./routes/incidenciaRoutes');
app.use('/api/v1/incidencias', incidenciaRoutes);

module.exports = app;