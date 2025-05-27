const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

// Middleware para verificar que es admin
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado - Solo administradores' });
    }

    req.user = { id: decoded.id, role: currentUser.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// POST /api/users/add-points - Agregar puntos al usuario autenticado
router.post('/add-points', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.points += points;
    await user.save();

    res.json({ success: true, newPoints: user.points });
  } catch (err) {
    console.error('Error al actualizar puntos:', err);
    res.status(500).json({ error: 'Error al actualizar puntos' });
  }
});

// GET /api/users/:id - Obtener un usuario específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error en /users/:id:", err);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

// ===== RUTAS DE ADMINISTRACIÓN =====

// GET /api/users/admin/all - Listar todos los usuarios (solo admin)
router.get('/admin/all', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ username: 1 });
    res.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// PUT /api/users/admin/:id - Actualizar usuario (solo admin)
router.put('/admin/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validar que no se intente cambiar el password aquí
    if (updates.password) {
      delete updates.password;
    }

    // Validar que el rol sea válido
    if (updates.role && !['user', 'admin'].includes(updates.role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // Validar que los puntos sean un número válido
    if (updates.points !== undefined && (isNaN(updates.points) || updates.points < 0)) {
      return res.status(400).json({ error: 'Los puntos deben ser un número válido mayor o igual a 0' });
    }

    const user = await User.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/users/admin/:id - Eliminar usuario (solo admin)
router.delete('/admin/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Evitar que un admin se elimine a sí mismo
    if (req.user.id === id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Opcional: Evitar eliminar otros administradores
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'No se pueden eliminar cuentas de administrador' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// POST /api/users/admin/create - Crear nuevo usuario (solo admin)
router.post('/admin/create', adminMiddleware, async (req, res) => {
  try {
    const { username, password, role = 'user', points = 0 } = req.body;

    // Validaciones
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    const newUser = new User({
      username,
      password, // El modelo se encarga del hash
      role,
      points
    });

    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      points: newUser.points
    };

    res.status(201).json({ 
      message: 'Usuario creado correctamente', 
      user: userResponse 
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }
    
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// GET /api/users/admin/stats - Estadísticas de usuarios (solo admin)
router.get('/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const averagePoints = totalUsers > 0 ? 
      (totalPoints.length > 0 ? totalPoints[0].total / totalUsers : 0) : 0;

    res.json({
      totalUsers,
      adminUsers,
      regularUsers,
      totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0,
      averagePoints: Math.round(averagePoints * 100) / 100
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;