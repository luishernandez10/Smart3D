const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ➕ Crear sede
router.post('/', async (req, res) => {
  try {
    const { nombre, direccion, distrito, estado } = req.body;

    if (!nombre || !direccion || !distrito || !estado) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const nuevaSede = await prisma.sede.create({
      data: { nombre, direccion, distrito, estado }
    });

    res.status(201).json(nuevaSede);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar sede' });
  }
});

// 📄 Obtener sedes
router.get('/', async (req, res) => {
  try {
    const sedes = await prisma.sede.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(sedes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sedes' });
  }
});

// 📝 Actualizar sede
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, direccion, distrito, estado } = req.body;

    const sedeActualizada = await prisma.sede.update({
      where: { id },
      data: { nombre, direccion, distrito, estado }
    });

    res.json(sedeActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar sede' });
  }
});

// ❌ Eliminar sede
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sedeEliminada = await prisma.sede.delete({
      where: { id }
    });
    res.json(sedeEliminada);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar sede' });
  }
});

module.exports = router;
