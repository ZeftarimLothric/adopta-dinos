// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
