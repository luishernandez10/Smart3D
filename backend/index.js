const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,https://smart3-d.vercel.app').split(',').map(origin => origin.trim())
}));

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
const { PrismaClient } = require('@prisma/client');
const { createSecurity } = require('./security');
const { validate } = require('./validation');
const security = createSecurity(new PrismaClient());
app.locals.security = security;
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api', (req, res, next) => {
  const publicRead = req.method === 'GET' && /^\/(sedes|talleres)\/?$/.test(req.path);
  const publicSignup = req.method === 'POST' && /^\/inscripciones\/(robokids|robojuniors)\/?$/.test(req.path);
  if (req.path.startsWith('/auth/')) return next();
  if (publicRead || publicSignup) return next();
  security.authenticate(req, res, () => security.authorize(req, res, next));
});
app.use('/api/inscripciones', (req, res, next) => {
  if (req.method === 'POST') {
    // A public submission must never mark itself as paid.
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) req.body.pago = 'Pendiente';
  }
  next();
});

app.use('/api', validate);

// Rutas
const inscripcionesRoutes = require('./routes/inscripciones');
app.use('/api/inscripciones', inscripcionesRoutes);

const docentesRoutes = require('./routes/docentes');
app.use('/api/docentes', docentesRoutes);

const talleresRoutes = require('./routes/talleres');
app.use('/api/talleres', talleresRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const sedeRoutes = require('./routes/sedes');
app.use('/api/sedes', sedeRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(err.type === 'entity.too.large' ? 413 : err instanceof SyntaxError ? 400 : 500).json({ error: 'Solicitud inválida o error del servidor' });
});
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ Backend funcionando correctamente');
});

if (require.main === module) app.listen(PORT, () => {
  console.log(`🟢 Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;
