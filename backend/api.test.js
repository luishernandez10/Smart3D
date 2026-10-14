const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const admin = { id: 1, username: 'admin', rol: 'Administrador', password: bcrypt.hashSync('correct-password', 10) };
const teacher = { ...admin, id: 2, username: 'teacher', rol: 'Docente' };
const select = (record, fields) => fields ? Object.fromEntries(Object.keys(fields).map(key => [key, record[key]])) : record;
let writes = 0;
const model = {
  findMany: async ({ select: fields } = {}) => [select(admin, fields)],
  create: async ({ data, select: fields }) => { writes++; return select({ id: 3, ...data }, fields); },
  update: async ({ data, select: fields }) => { writes++; return select({ ...admin, ...data }, fields); },
  delete: async ({ select: fields }) => { writes++; return select(admin, fields); },
};
const prisma = {
  docente: { ...model, findUnique: async ({ where }) => [admin, teacher].find(user => user.username === where.username || user.id === where.id) },
  sede: model, taller: model, inscripcionRoboKids: model, inscripcionRoboJuniors: model,
};
require.cache[require.resolve('@prisma/client')] = { exports: { PrismaClient: function () { return prisma; } } };
const app = require('./index');
test('API completa: autorización, login, no exposición de hashes e inscripciones públicas', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const request = (path, method = 'GET', body, token) => fetch(url + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const protectedRoutes = [['/docentes','GET'], ['/docentes','POST'], ['/docentes/1','PUT'], ['/docentes/1','DELETE'], ['/sedes','POST'], ['/sedes/1','PUT'], ['/sedes/1','DELETE'], ['/talleres','POST'], ['/talleres/1','PUT'], ['/talleres/1','DELETE'], ['/inscripciones/robokids','GET'], ['/inscripciones/robojuniors','GET'], ['/inscripciones/robokids/1','PATCH'], ['/inscripciones/robojuniors/1','PATCH']];
  const teacherToken = app.locals.security.issue(teacher);
  for (const [path, method] of protectedRoutes) {
    assert.equal((await request(path,method,method === 'GET' ? undefined : {})).status, 401, path);
    assert.equal((await request(path,method,method === 'GET' ? undefined : {},teacherToken)).status, 403, path);
  }
  assert.equal(writes, 0);
  for (const username of ['missing','admin']) assert.equal((await request('/auth/login','POST',{username,password:'wrong'})).status,401);
  const logged = await request('/auth/login','POST',{username:'admin',password:'correct-password'});
  const { token, docente } = await logged.json(); assert.ok(token); assert.equal(docente.password, undefined);
  const payload = { nombres:'Ana', apellidos:'Pérez', fechaNacimiento:'1990-01-01', telefono:'999999999', direccion:'Lima', fechaContrato:'2025-01-01', rol:'Docente', username:'new', password:'safe-password-123' };
  for (const [path, method, body] of [['/docentes','GET'],['/docentes','POST',payload],['/docentes/1','PUT',{nombres:'Ana',password:''}],['/docentes/1','DELETE']]) {
    const res = await request(path,method,body,token); assert.ok(res.ok); assert.ok(!(await res.text()).includes('password'));
  }
  for (const kind of ['robokids','robojuniors']) {
    const res = await request('/inscripciones/'+kind,'POST',{ nombres:'Ana',apellidos:'Pérez',dni:'12345678',fecha:'2020-01-01',grado:'Primero',telefono:'999999999',sede:'Lima',pago:'Pagado' });
    assert.equal(res.status,201); assert.equal((await res.json()).pago,'Pendiente');
  }
  assert.equal((await request('/sedes')).status,200); assert.equal((await request('/talleres')).status,200);
  assert.equal((await request('/docentes/1abc','DELETE',undefined,token)).status,400);
  assert.equal((await request('/docentes/1','PUT',{id:7},token)).status,400);
  assert.equal((await request('/auth/logout','POST',undefined,token)).status,204);
  assert.equal((await request('/auth/me','GET',undefined,token)).status,401);
});
