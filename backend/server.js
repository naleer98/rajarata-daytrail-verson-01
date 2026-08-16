const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const isDevelopment = process.env.NODE_ENV !== 'production';
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/$/, '');

const isDevelopmentOrigin = (origin) => {
  if (!isDevelopment) return false;
  try {
    const url = new URL(origin);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = !origin
      || allowedOrigins.length === 0
      || allowedOrigins.includes(normalizedOrigin)
      || isDevelopmentOrigin(normalizedOrigin);

    if (isAllowed) return callback(null, true);

    const error = new Error(`Origin ${normalizedOrigin} is not allowed by CORS.`);
    error.status = 403;
    return callback(error);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'RajaRata DayTrail API' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/itineraries', require('./routes/itineraryRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

app.get('/', (req, res) => res.json({ message: 'RajaRata DayTrail API is running.' }));
app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error.message);
  return res.status(error.status || 500).json({ message: error.message || 'Unexpected server error.' });
});

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDB();
  app.listen(port, () => console.log(`RajaRata DayTrail API listening on port ${port}`));
}

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
