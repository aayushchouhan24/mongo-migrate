const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'mongodb-backup-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Web UI
app.get('/', (req, res) => res.render('index'));

// API
app.use('/api', apiRoutes);

// Health
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ success: false, message: process.env.NODE_ENV === 'development' ? err.message : 'Internal error' });
});

function startServer(port = PORT) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`UI: http://localhost:${port}`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
