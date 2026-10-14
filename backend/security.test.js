const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createSecurity } = require('./security');
const { validate } = require('./validation');
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, sendStatus(code) { this.statusCode = code; } });
test('sesiones: token requerido, rol actual y revocación por contraseña/logout', async () => {
  let user = { id: 1, password: 'hash-a', rol: 'Docente', username: 'user' };
  const security = createSecurity({ docente: { findUnique: async () => user } });
  const token = security.issue(user);
  const req = { get: () => `Bearer ${token}` };
  let called = false;
  await security.authenticate({ get: () => '' }, response(), () => { called = true; });
  assert.equal(called, false);
  await security.authenticate(req, response(), () => { called = true; });
  assert.equal(called, true);
  let res = response(); security.authorize(req, res, () => assert.fail()); assert.equal(res.statusCode, 403);
  user.rol = 'Administrador'; await security.authenticate(req, response(), () => {});
  security.authorize(req, response(), () => { called = true; });
  user.password = 'hash-b'; res = response(); await security.authenticate(req, res, () => assert.fail()); assert.equal(res.statusCode, 401);
  const second = security.issue(user); req.get = () => `Bearer ${second}`;
  security.logout(req, response()); res = response(); await security.authenticate(req, res, () => assert.fail()); assert.equal(res.statusCode, 401);
});
test('sesiones caducadas y límite de login', async () => {
  const security = createSecurity({});
  const token = security.issue({ id: 1, password: 'hash' });
  const now = Date.now; Date.now = () => now() + 3600001;
  try { const res = response(); await security.authenticate({ get: () => `Bearer ${token}` }, res, () => assert.fail()); assert.equal(res.statusCode, 401); }
  finally { Date.now = now; }
  for (let i = 0; i < 20; i++) security.limit({ ip: 'test' }, response(), () => {});
  const res = response(); security.limit({ ip: 'test' }, res, () => assert.fail()); assert.equal(res.statusCode, 429);
});
test('validación rechaza IDs parciales, asignación masiva, fechas y contraseñas inválidas', () => {
  for (const req of [
    { path: '/docentes/1abc', method: 'DELETE' },
    { path: '/docentes/1', method: 'PUT', body: { id: 3 } },
    { path: '/docentes/1', method: 'PUT', body: { password: 'short' } },
    { path: '/docentes/1', method: 'PUT', body: { fechaNacimiento: '2025-02-31' } },
    { path: '/docentes/1', method: 'PUT', body: { rol: 'superuser' } },
    { path: '/inscripciones/robokids', method: 'GET', query: { dni: { equals: 'x' } } },
  ]) { const res = response(); validate(req, res, () => assert.fail()); assert.equal(res.statusCode, 400); }
});
test('inscripción pública válida y edición sin cambiar contraseña', () => {
  let called = 0;
  validate({ path: '/inscripciones/robokids', method: 'POST', body: { nombres: 'Ana', apellidos: 'Pérez', dni: '12345678', fecha: '2020-01-01', grado: 'Primero', telefono: '999999999', pago: 'Pendiente', sede: 'Lima' } }, response(), () => called++);
  const req = { path: '/docentes/1', method: 'PUT', body: { nombres: 'Ana', password: '' } };
  validate(req, response(), () => called++); assert.equal(called, 2); assert.equal(Object.hasOwn(req.body, 'password'), false);
});
