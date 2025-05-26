// backend/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const Dinosaur = require('./models/Dinosaur');

const dinos = [
  {
    name: 'Tyrannosaurus Rex',
    type: 'Carnivore',
    period: 'Cretaceous',
    rarity: 'Legendary',
    description: 'El rey de los dinosaurios carnívoros.',
    imageUrl: 'https://example.com/trex.jpg',
    adoptionCost: 1000,
  },
  {
    name: 'Triceratops',
    type: 'Herbivore',
    period: 'Cretaceous',
    rarity: 'Rare',
    description: 'Dinosaurio herbívoro con tres cuernos.',
    imageUrl: 'https://example.com/triceratops.jpg',
    adoptionCost: 500,
  },
  {
    name: 'Velociraptor',
    type: 'Carnivore',
    period: 'Cretaceous',
    rarity: 'Rare',
    description: 'Pequeño y rápido depredador.',
    imageUrl: 'https://example.com/velociraptor.jpg',
    adoptionCost: 700,
  },
  {
    name: 'Stegosaurus',
    type: 'Herbivore',
    period: 'Jurassic',
    rarity: 'Common',
    description: 'Dinosaurio con placas en el lomo.',
    imageUrl: 'https://example.com/stegosaurus.jpg',
    adoptionCost: 300,
  },
  {
    name: 'Compsognathus',
    type: 'Omnivore',
    period: 'Jurassic',
    rarity: 'Common',
    description: 'Pequeño dinosaurio omnívoro.',
    imageUrl: 'https://example.com/compsognathus.jpg',
    adoptionCost: 200,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB para insertar dinos.');

    // Primero borramos todos los dinos actuales para evitar duplicados
    await Dinosaur.deleteMany({});
    console.log('Datos anteriores borrados.');

    // Insertamos los nuevos dinos
    await Dinosaur.insertMany(dinos);
    console.log('Dinosaurios insertados correctamente.');

    process.exit(0); // Salir del script
  } catch (err) {
    console.error('Error al insertar dinos:', err);
    process.exit(1);
  }
}

seed();
