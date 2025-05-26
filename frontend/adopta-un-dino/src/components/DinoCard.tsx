import React from 'react';
import type { Dino } from '../types/Dino';

interface Props {
  dino: Dino;
  onEdit: (dino: Dino) => void;
  onDelete: (id: number) => void;
}

const DinoCard: React.FC<Props> = ({ dino, onEdit, onDelete }) => (
  <div className="bg-white rounded shadow p-4 w-64">
    <img src={dino.image} alt={dino.name} className="h-40 object-cover rounded" />
    <h3 className="font-bold text-xl mt-2">{dino.name}</h3>
    <p className="text-gray-600">{dino.species}</p>
    <p className="text-pink-600 font-semibold">Costo: {dino.adoptionCost}</p>
    <div className="flex justify-between mt-2">
      <button onClick={() => onEdit(dino)} className="text-blue-600 hover:underline">Editar</button>
      <button onClick={() => onDelete(dino.id)} className="text-red-600 hover:underline">Eliminar</button>
    </div>
  </div>
);

export default DinoCard;
