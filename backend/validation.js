const fields = {
  docentes: ['nombres', 'apellidos', 'fechaNacimiento', 'telefono', 'direccion', 'fechaContrato', 'rol', 'username', 'password'],
  sedes: ['nombre', 'direccion', 'distrito', 'estado'],
  talleres: ['nombre', 'informacion'],
  inscripciones: ['apellidos', 'nombres', 'dni', 'fecha', 'grado', 'telefono', 'pago', 'sede'],
};
function validate(req, res, next) {
  // Mounted at /api: path starts with the resource.
  const parts = req.path.split('/').filter(Boolean);
  const kind = parts[0];
  const allowed = fields[kind];
  if (!allowed) return next();
  const identifier = kind === 'inscripciones' ? parts[2] : parts[1];
  if (identifier && (!/^[1-9]\d*$/.test(identifier) || !Number.isSafeInteger(Number(identifier)))) return res.status(400).json({ error: 'ID inválido' });
  if (req.method === 'GET') {
    if (Object.entries(req.query).some(([key, value]) => !allowed.includes(key) || typeof value !== 'string' || value.length > 200)) return res.status(400).json({ error: 'Filtro inválido' });
    return next();
  }
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();
  const body = req.body;
  const keys = kind === 'inscripciones' && req.method === 'PATCH' ? ['pago'] : allowed;
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !keys.includes(key))) return res.status(400).json({ error: 'Campos inválidos' });
  if (kind === 'docentes' && req.method === 'PUT' && body.password === '') delete body.password;
  const required = req.method === 'POST' ? allowed : req.method === 'PATCH' ? keys : [];
  if (required.some(key => !Object.hasOwn(body, key)) || !Object.keys(body).length) return res.status(400).json({ error: 'Faltan campos' });
  for (const [key, value] of Object.entries(body)) {
    const max = key === 'informacion' ? 10000 : key === 'direccion' ? 500 : 200;
    if (typeof value !== 'string' || !value.trim() || value.length > max) return res.status(400).json({ error: `Campo inválido: ${key}` });
    if (key === 'password' && (value.length < 12 || Buffer.byteLength(value, 'utf8') > 72)) return res.status(400).json({ error: 'Contraseña: mínimo 12 caracteres y máximo 72 bytes' });
    if (['fecha', 'fechaNacimiento', 'fechaContrato'].includes(key) && (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value.slice(0, 10))) return res.status(400).json({ error: 'Fecha inválida' });
    if (key === 'rol' && !['admin', 'administrador', 'docente'].includes(value.trim().toLowerCase())) return res.status(400).json({ error: 'Rol inválido' });
    if (key === 'pago' && !['Pendiente', 'Pagado'].includes(value)) return res.status(400).json({ error: 'Pago inválido' });
    if (key === 'estado' && !['Activo', 'Inactivo'].includes(value)) return res.status(400).json({ error: 'Estado inválido' });
    if (key === 'dni' && !/^\d{8}$/.test(value)) return res.status(400).json({ error: 'DNI inválido' });
  }
  next();
}
module.exports = { validate };
