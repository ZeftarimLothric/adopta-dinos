const mongoose = require('mongoose');

const dinosaurSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Herbivore', 'Carnivore', 'Omnivore'], required: true },
  period: String,
  rarity: { type: String, enum: ['Common', 'Rare', 'Legendary'], default: 'Common' },
  description: String,
  imageUrl: String,
  adoptionCost: Number,
  adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Dinosaur', dinosaurSchema);
