// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');



router.post('/add-points', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // asumimos que el middleware pone el ID aquí
    const { points } = req.body;

    const user = await User.findById(userId);
    user.points += points;
    await user.save();

    res.json({ success: true, newPoints: user.points });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar puntos' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password'); // excluye el password
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error en /users/:id:", err);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

module.exports = router;
