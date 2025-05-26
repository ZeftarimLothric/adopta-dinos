import React, { useState, useEffect } from 'react';
import type { Dino } from '../types/Dino';

interface Props {
  onSubmit: (dino: Dino) => void;
  initial?: Dino;
}

const DinoForm: React.FC<Props> = ({ onSubmit, initial }) => {
  const [form, setForm] = useState<Dino>(
    initial ?? { id: Date.now(), name: '', species: '', image: '', adoptionCost: 0 }
  );

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'adoptionCost' ? Number(value) : value });
  };

  return (
    <form
      className="bg-white p-4 rounded shadow-md space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
        if (!initial) setForm({ id: Date.now(), name: '', species: '', image: '', adoptionCost: 0 });
      }}
    >
      <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} className="input" required />
      <input name="species" placeholder="Especie" value={form.species} onChange={handleChange} className="input" required />
      <input name="image" placeholder="URL de imagen" value={form.image} onChange={handleChange} className="input" required />
      <input name="adoptionCost" type="number" placeholder="Costo" value={form.adoptionCost} onChange={handleChange} className="input" required />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        {initial ? 'Guardar cambios' : 'Agregar Dinosaurio'}
      </button>
    </form>
  );
};

export default DinoForm;
