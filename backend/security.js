const { randomBytes, createHash } = require('node:crypto');
const adminRoles = new Set(['admin', 'administrador']);
const isAdmin = rol => typeof rol === 'string' && adminRoles.has(rol.trim().toLowerCase());
const fingerprint = value => createHash('sha256').update(value).digest('hex');

function createSecurity(prisma) {
  const sessions = new Map();
  const attempts = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of sessions) if (value.expires <= now) sessions.delete(key);
    for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  }, 60000);
  cleanup.unref();
  const tokenKey = req => fingerprint((req.get('authorization') || '').replace(/^Bearer /, ''));
  return {
    issue(docente) {
      const token = randomBytes(32).toString('base64url');
      sessions.set(fingerprint(token), { id: docente.id, password: fingerprint(docente.password), expires: Date.now() + 3600000 });
      return token;
    },
    logout(req, res) { sessions.delete(tokenKey(req)); res.sendStatus(204); },
    limit(req, res, next) {
      const key = req.ip;
      const now = Date.now();
      let entry = attempts.get(key);
      if (!entry || entry.expires <= now) {
        if (attempts.size >= 10000) return res.status(429).json({ error: 'Intente más tarde' });
        entry = { count: 0, expires: now + 900000 }; attempts.set(key, entry);
      }
      if (++entry.count > 20) return res.status(429).json({ error: 'Intente más tarde' });
      next();
    },
    async authenticate(req, res, next) {
      const key = tokenKey(req);
      const session = sessions.get(key);
      if (!session || session.expires <= Date.now()) return res.status(401).json({ error: 'Sesión requerida' });
      try {
        const user = await prisma.docente.findUnique({ where: { id: session.id } });
        if (!user || fingerprint(user.password) !== session.password) {
          sessions.delete(key); return res.status(401).json({ error: 'Sesión inválida' });
        }
        req.user = { id: user.id, username: user.username, rol: user.rol };
        next();
      } catch { res.status(503).json({ error: 'Autenticación no disponible' }); }
    },
    authorize(req, res, next) {
      if (!isAdmin(req.user?.rol)) return res.status(403).json({ error: 'Se requiere rol administrador' });
      next();
    },
  };
}
module.exports = { createSecurity, isAdmin };
