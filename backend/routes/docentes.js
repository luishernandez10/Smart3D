const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const publicFields = { id: true, nombres: true, apellidos: true, fechaNacimiento: true, telefono: true, direccion: true, fechaContrato: true, rol: true, username: true, creadoEn: true };

// ➕ Crear nuevo docente
router.post('/', async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      fechaNacimiento,
      telefono,
      direccion,
      fechaContrato,
      rol,
      username,
      password
    } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }

    const fechaNacimientoObj = new Date(fechaNacimiento);
    const fechaContratoObj = new Date(fechaContrato);

    if (isNaN(fechaNacimientoObj) || isNaN(fechaContratoObj)) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevo = await prisma.docente.create({
      select: publicFields,
      data: {
        nombres,
        apellidos,
        fechaNacimiento: fechaNacimientoObj.toISOString(),
        telefono,
        direccion,
        fechaContrato: fechaContratoObj.toISOString(),
        rol,
        username,
        password: hashedPassword
      }
    });

    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar docente' });
  }
});

// 📄 Obtener lista de docentes
router.get('/', async (req, res) => {
  try {
    const docentes = await prisma.docente.findMany({
      select: publicFields,
      orderBy: { id: 'desc' }
    });
    res.json(docentes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener docentes' });
  }
});

// 📝 Actualizar docente por ID
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = { ...req.body };

    if (data.fechaNacimiento) {
      const fNac = new Date(data.fechaNacimiento);
      if (isNaN(fNac)) return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
      data.fechaNacimiento = fNac.toISOString();
    }

    if (data.fechaContrato) {
      const fCon = new Date(data.fechaContrato);
      if (isNaN(fCon)) return res.status(400).json({ error: 'Fecha de contrato inválida' });
      data.fechaContrato = fCon.toISOString();
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const actualizado = await prisma.docente.update({
      where: { id },
      data,
      select: publicFields
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar docente' });
  }
});

// ❌ Eliminar docente
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const eliminado = await prisma.docente.delete({
      where: { id },
      select: publicFields
    });
    res.json(eliminado);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar docente' });
  }
});

module.exports = router;
