const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  // Nuevo campo para los scores del juego
  gameScores: {
    flappyPtero: {
      bestScore: { type: Number, default: 0 },
      totalGames: { type: Number, default: 0 },
      totalObstacles: { type: Number, default: 0 },
      lastPlayed: { type: Date, default: Date.now }
    }
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Método para comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para actualizar score del juego
userSchema.methods.updateGameScore = function(game, score) {
  if (!this.gameScores) {
    this.gameScores = {};
  }
  
  if (!this.gameScores[game]) {
    this.gameScores[game] = {
      bestScore: 0,
      totalGames: 0,
      totalObstacles: 0,
      lastPlayed: new Date()
    };
  }

  const gameData = this.gameScores[game];
  gameData.totalGames += 1;
  gameData.totalObstacles += score;
  gameData.lastPlayed = new Date();
  
  if (score > gameData.bestScore) {
    gameData.bestScore = score;
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);