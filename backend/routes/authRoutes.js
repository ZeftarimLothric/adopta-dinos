const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Registro
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role, points: 0 });
    await newUser.save();

    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    console.error("Error en /register:", err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      username: user.username,
      role: user.role,
      points: user.points,
    });
  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});


module.exports = router;
