const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// A valid dummy hash makes unknown usernames take the same password-check path.
const dummyHash = bcrypt.hashSync('unused-random-placeholder', 10);
router.post('/login', (req, res, next) => req.app.locals.security.limit(req, res, next), async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || username.length > 200 || typeof password !== 'string' || !password || Buffer.byteLength(password) > 72) return res.status(400).json({ message: 'Credenciales inválidas' });
  try {
    const docente = await prisma.docente.findUnique({ where: { username } });
    const valid = await bcrypt.compare(password, docente?.password || dummyHash);
    if (!docente || !valid) return res.status(401).json({ message: 'Credenciales inválidas' });
    res.set('Cache-Control', 'no-store');
    res.json({ message: 'Inicio de sesión exitoso', token: req.app.locals.security.issue(docente), docente: { id: docente.id, username: docente.username, rol: docente.rol } });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});
router.get('/me', (req, res, next) => req.app.locals.security.authenticate(req, res, next), (req, res) => {
  res.set('Cache-Control', 'no-store'); res.json({ docente: req.user });
});
router.post('/logout', (req, res) => req.app.locals.security.logout(req, res));
module.exports = router;
