const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtener todos los talleres
router.get("/", async (req, res) => {
  try {
    const talleres = await prisma.taller.findMany();
    res.json(talleres);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener talleres" });
  }
});

// Crear taller
router.post("/", async (req, res) => {
  try {
    const { nombre, informacion } = req.body;
    const nuevoTaller = await prisma.taller.create({
      data: { nombre, informacion },
    });
    res.json(nuevoTaller);
  } catch (error) {
    res.status(500).json({ error: "Error al crear taller" });
  }
});

// Editar taller
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, informacion } = req.body;
    const actualizado = await prisma.taller.update({
      where: { id },
      data: { nombre, informacion },
    });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar taller" });
  }
});

// Eliminar taller
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.taller.delete({ where: { id } });
    res.json({ mensaje: "Taller eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar taller" });
  }
});

module.exports = router;
