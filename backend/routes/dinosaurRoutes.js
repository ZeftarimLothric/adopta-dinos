// backend/routes/dinosaurRoutes.js
const express = require('express');
const router = express.Router();
const Dinosaur = require('../models/Dinosaur');
const User = require('../models/User');
const {authenticateToken} = require('../middlewares/authMiddleware');

// Obtener tipos y rarezas únicas
router.get('/metadata', async (req, res) => {
  try {
    const types = await Dinosaur.distinct("type");
    const rarities = await Dinosaur.distinct("rarity");
    res.json({ types, rarities });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener metadatos' });
  }
});

// GET todos los dinosaurios
// Obtener todos los dinosaurios
router.get('/', async (req, res) => {
  try {
    const dinos = await Dinosaur.find().populate('adoptedBy', 'username');
    res.json(dinos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los dinosaurios' });
  }
});


// POST para crear un dinosaurio
router.post('/', async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      // Crear varios dinosaurios
      const dinos = await Dinosaur.insertMany(req.body);
      res.status(201).json(dinos);
    } else {
      // Crear un solo dinosaurio
      const newDino = new Dinosaur(req.body);
      await newDino.save();
      res.status(201).json(newDino);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error al crear dinosaurio(s)' });
  }
});

// Buscar dinosaurios por tipo y/o rareza
router.get('/search', async (req, res) => {

  const { type, rarity } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (rarity) filter.rarity = rarity;

  try {
    const dinos = await Dinosaur.find(filter);
    console.log('Dinosaurios encontrados:', dinos.length);
    res.json(dinos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar dinosaurios'});
  }
});

// GET un dinosaurio por ID
router.get('/:id', async (req, res) => {
  try {
    const dino = await Dinosaur.findById(req.params.id);
    if (!dino) return res.status(404).json({ error: 'Dinosaurio no encontrado' });
    res.json(dino);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar el dinosaurio' });
  }
});

// PUT para editar un dinosaurio
router.put('/:id', async (req, res) => {
  try {
    const updatedDino = await Dinosaur.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedDino) return res.status(404).json({ error: 'Dinosaurio no encontrado' });
    res.json(updatedDino);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar dinosaurio' });
  }
});

// DELETE para borrar un dinosaurio
router.delete('/:id', async (req, res) => {
  try {
    const deletedDino = await Dinosaur.findByIdAndDelete(req.params.id);
    if (!deletedDino) return res.status(404).json({ error: 'Dinosaurio no encontrado' });
    res.json({ message: 'Dinosaurio eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar dinosaurio' });
  }
});

// Adoptar dinosaurio
router.post('/:id/adopt', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const dino = await Dinosaur.findById(req.params.id);
    if (!dino) return res.status(404).json({ error: 'Dinosaurio no encontrado' });
    if (dino.adoptedBy) return res.status(400).json({ error: 'Este dinosaurio ya fue adoptado' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.points < dino.adoptionCost) {
      return res.status(400).json({ error: 'No tienes suficientes puntos para adoptar este dinosaurio' });
    }

    // Resta puntos y marca la adopción
    user.points -= dino.adoptionCost;
    dino.adoptedBy = userId;

    await user.save();
    await dino.save();
    await dino.populate('adoptedBy', 'username');

    // Devolvemos el dino y solo los puntos restantes
    res.json({
      message: '¡Dinosaurio adoptado con éxito!',
      dino,
      remainingPoints: user.points
    });
  } catch (err) {
    console.error("Error en la adopción:", err);
    res.status(500).json({ error: 'Error al intentar adoptar el dinosaurio' });
  }
});




// Ruta para cancelar adopción de un dinosaurio
router.post('/:id/release', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const dino = await Dinosaur.findById(req.params.id);
    if (!dino) return res.status(404).json({ error: 'Dinosaurio no encontrado' });

    // Usar toString para comparar ObjectId con string
    if (!dino.adoptedBy || dino.adoptedBy.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para liberar este dinosaurio' });
    }

    dino.adoptedBy = null;
    await dino.save();

    res.json({ message: 'Dinosaurio liberado con éxito', dino });
  } catch (err) {
    res.status(500).json({ error: 'Error al liberar el dinosaurio' });
  }
});



module.exports = router;
