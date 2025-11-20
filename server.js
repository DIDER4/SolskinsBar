/**
 * Solskinsbar Server
 * Main application entry point
 */

const express = require('express');
const path = require('path');
const config = require('./src/config/app.config');
const apiRoutes = require('./src/routes/api');

const app = express();

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, config.paths.views));

// Middleware
app.use(express.static(path.join(__dirname, config.paths.public)));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Solskinsbar - Find barer med sol'
  });
});

// API routes
app.use('/api', apiRoutes);

// Start server
app.listen(config.port, () => {
  console.log(`🌞 Solskinsbar kører på http://localhost:${config.port}`);
  if (config.env === 'development') {
    console.log(`📍 Environment: ${config.env}`);
  }
});
