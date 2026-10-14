# Configuración y cambios de seguridad

## Despliegue

1. En `backend`, ejecutar `npm ci` y `npx prisma generate`. Configurar `DATABASE_URL`, `PORT` y `CORS_ORIGINS` (orígenes exactos separados por comas) usando `.env.example`. No publicar el archivo `.env`.
2. El login usa cuentas existentes de `Docente`. Antes del despliegue, verificar en una herramienta administrativa de confianza (por ejemplo `npx prisma studio`) que al menos una cuenta tenga `rol` igual a `Admin` o `Administrador`. Se ignoran mayúsculas y espacios exteriores. No existe registro público de administradores. Otros roles, incluido `Docente`, no acceden al panel administrativo.
3. Las contraseñas deben estar hasheadas con bcrypt. Para datos antiguos en texto plano, hacer una copia de seguridad y ejecutar `node hash_docentes.js` una sola vez en el entorno privado. El script respeta hashes bcrypt existentes. No imprime contraseñas ni hashes.
4. En `frontend`, ejecutar `npm ci`, configurar `VITE_API_URL` con la URL HTTPS del backend (sin `/api` al final), y ejecutar `npm run build`. Desplegar backend y frontend juntos; las sesiones antiguas de localStorage ya no permiten entrar.
5. Usar HTTPS en producción. El proxy debe conservar una IP de cliente fiable si se desea adaptar el límite de login; no se activa `trust proxy` a ciegas. Por defecto se limita a 20 intentos por IP de conexión cada 15 minutos (un proxy compartido puede compartir ese límite).

## Sesiones y autorización

El login devuelve un token opaco aleatorio de 256 bits, válido una hora. Se almacena en sessionStorage, se transmite mediante `Authorization: Bearer TOKEN` y se revoca con `POST /api/auth/logout`. `GET /api/auth/me` permite consultar el usuario actual. No se usan cookies de autenticación. El servidor guarda solo el digest del token y comprueba en la base de datos el usuario, su contraseña y su rol en cada petición. Borrar al usuario o cambiar su contraseña invalida su sesión; cambiar su rol afecta inmediatamente a sus permisos. Nunca se confía en el rol guardado en el navegador.

Las sesiones y límites residen en memoria: reiniciar el backend cierra sesiones. Esta implementación requiere **una sola instancia**; antes de usar múltiples procesos o réplicas, migrar sesiones y límites a un almacén compartido con TTL. No configurar réplicas sin ese cambio. Un token robado puede usarse hasta revocación/caducidad; conservar la protección contra XSS del frontend.

## Contratos y compatibilidad

- Todas las operaciones sobre docentes, la lectura de inscripciones y la actualización de pagos requieren sesión y rol administrador. Las escrituras de sedes y talleres también. Sin sesión se devuelve 401; sin rol, 403.
- `GET /api/sedes` y `GET /api/talleres` siguen siendo públicos. Ambos POST de inscripción (`/api/inscripciones/robokids` y `/api/inscripciones/robojuniors`) siguen siendo públicos, con los mismos campos. El servidor fuerza `pago: Pendiente`, incluso si se envía `Pagado`; marcar un pago requiere el PATCH administrativo posterior.
- Las respuestas de docentes (crear, listar, editar y borrar) ya no incluyen `password`. Los errores no incluyen mensajes internos de Prisma ni hashes. El login usa el mismo 401 para usuario inexistente y contraseña incorrecta.
- Se rechazan campos desconocidos, tipos incorrectos, filtros estructurados, IDs no enteros positivos, fechas inválidas y valores fuera de catálogo. DNI: ocho dígitos. Roles aceptados al escribir: Admin, Administrador o Docente (sin distinguir mayúsculas). Pago: Pendiente/Pagado. Sede: Activo/Inactivo. Textos: hasta 200 caracteres; dirección: 500; información de taller: 10000. JSON: máximo 32 KiB. Las contraseñas nuevas tienen mínimo 12 caracteres y máximo 72 bytes UTF-8; al editar, contraseña vacía significa conservar la actual. Las existentes no necesitan cambiar para iniciar sesión salvo que excedan el límite bcrypt de 72 bytes.
- Las pantallas campus, inscripciones, docentes, sedes/detalle, talleres administrativos y detalle de proyecto verifican sesión y rol antes de renderizarse. Los clientes externos administrativos deben añadir el token a cada petición.
- Se actualizan dependencias vulnerables mediante los lockfiles. Swiper pasa de 11 a 12 para corregir una alerta crítica; se conservan las importaciones React, Pagination y CSS del carrusel y se verifica la compilación. Revisar visualmente el carrusel antes de desplegar.

## Verificación

Backend: `npm test`, `npx prisma generate`, `npm audit`.
Frontend: `npm run build`, `npm run lint`, `npm audit`.

Las pruebas HTTP ejercitan Express con Prisma simulado: rechazos 401/403 antes de escribir, login, exclusión de hashes en todas las respuestas de docentes, logout, validación e inscripciones públicas con pago pendiente. Las pruebas de sesiones incluyen caducidad y revocación por contraseña. No se ejecutan migraciones ni se modifica una base de datos de producción. Antes de desplegar, probar con PostgreSQL de staging el login de administrador/docente, CRUD, ambas inscripciones públicas y el carrusel. No hay cambios al esquema de Prisma.
