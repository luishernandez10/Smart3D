// hash_docentes.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPasswords() {
  try {
    const docentes = await prisma.docente.findMany();

    for (const docente of docentes) {
      if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(docente.password)) {
        const hashedPassword = await bcrypt.hash(docente.password, 10);

        await prisma.docente.update({
          where: { id: docente.id },
          data: { password: hashedPassword },
        });

        console.log(`🔐 Contraseña actualizada para: ${docente.username}`);
      }
    }

    console.log('✅ Todas las contraseñas han sido hasheadas.');
  } catch (error) {
    console.error('Error al migrar contraseñas');
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

hashPasswords();
