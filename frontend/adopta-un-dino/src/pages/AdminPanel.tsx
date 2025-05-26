// src/pages/AdminPanel.tsx
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

interface AdoptedBy {
  _id: string;
  username: string;
}

type Dino = {
  _id: string;
  name: string;
  type: string;
  rarity: string;
  period: string;
  description: string;
  adoptionCost: number;
  adoptedBy?: string | AdoptedBy | null;
};

const AdminPanel: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [dinos, setDinos] = useState<Dino[]>([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    } else {
      fetch("http://localhost:3000/api/dinos")
        .then((res) => res.json())
        .then(setDinos)
        .catch((err) => console.error("Error fetching dinos (admin):", err));
    }
  }, [navigate, user]);

  // Metadata para tipos y rarezas
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/dinos/metadata")
      .then((res) => res.json())
      .then((data) => {
        setTypes(data.types);
        setRarities(data.rarities);
      })
      .catch((err) => console.error("Error fetching metadata:", err));
  }, []);

  // Estado para nuevo dino
  const [newDino, setNewDino] = useState({
    name: "",
    type: "",
    rarity: "",
    adoptionCost: 0,
    period: "",
    description: "",
    imageUrl: "",
  });

  // Para editar dinos: guardamos los cambios en un estado separado
  const [editDinos, setEditDinos] = useState<Record<string, Dino>>({});

  // Cuando carga dinos, inicializamos editDinos con sus datos
  useEffect(() => {
    const initialEditState: Record<string, Dino> = {};
    dinos.forEach((d) => {
      initialEditState[d._id] = { ...d };
    });
    setEditDinos(initialEditState);
  }, [dinos]);

  const handleAddDino = async () => {
    if (!newDino.name || !newDino.type || !newDino.rarity) {
      alert("Faltan campos obligatorios.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/dinos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDino),
      });
      const created = await res.json();
      setDinos((prev) => [...prev, created]);
      setNewDino({
        name: "",
        type: "",
        rarity: "",
        adoptionCost: 0,
        period: "",
        description: "",
        imageUrl: "",
      });
    } catch (err) {
      console.error("Error creando dino:", err);
    }
  };

  const handleDeleteDino = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/dinos/${id}`, {
        method: "DELETE",
      });
      setDinos((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Error borrando dino:", err);
    }
  };

  // Guardar cambios editados en backend
  const handleSaveEdit = async (id: string) => {
    const dinoToSave = editDinos[id];
    if (!dinoToSave.name || !dinoToSave.type || !dinoToSave.rarity) {
      alert("Faltan campos obligatorios para guardar.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/dinos/${id}`, {
        method: "PUT", // o PATCH si usas
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dinoToSave),
      });
      const updated = await res.json();
      setDinos((prev) => prev.map((d) => (d._id === id ? updated : d)));
      alert("Dino actualizado correctamente.");
    } catch (err) {
      console.error("Error actualizando dino:", err);
    }
  };

  // Maneja el cambio de input en editDinos
  const handleEditChange = (
    id: string,
    field: keyof Dino,
    value: string | number | null
  ) => {
    setEditDinos((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  return (
    <div className="px-8 py-5 bg-gray-300 min-h-screen">
      {/* Agregar nuevo dino */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Agregar nuevo dinosaurio</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Nombre"
            value={newDino.name}
            onChange={(e) => setNewDino({ ...newDino, name: e.target.value })}
          />

          <label>
            Tipo:
            <select
              className="border p-2 rounded w-full"
              value={newDino.type}
              onChange={(e) => setNewDino({ ...newDino, type: e.target.value })}
            >
              <option value="">Selecciona tipo</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Rareza:
            <select
              className="border p-2 rounded w-full"
              value={newDino.rarity}
              onChange={(e) =>
                setNewDino({ ...newDino, rarity: e.target.value })
              }
            >
              <option value="">Selecciona rareza</option>
              {rarities.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Costo de adopción"
            value={newDino.adoptionCost}
            onChange={(e) =>
              setNewDino({ ...newDino, adoptionCost: Number(e.target.value) })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Periodo"
            value={newDino.period}
            onChange={(e) => setNewDino({ ...newDino, period: e.target.value })}
          />

          <input
            className="border p-2 rounded"
            placeholder="URL de imagen"
            value={newDino.imageUrl}
            onChange={(e) =>
              setNewDino({ ...newDino, imageUrl: e.target.value })
            }
          />

          <textarea
            className="border p-2 rounded"
            placeholder="Descripción"
            value={newDino.description}
            onChange={(e) =>
              setNewDino({ ...newDino, description: e.target.value })
            }
          />
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleAddDino}
        >
          Agregar Dinosaurio
        </button>
      </div>

      {/* Listado con edición */}
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dinos.map((dino) => {
          const editDino = editDinos[dino._id];
          if (!editDino) return null;
          return (
            <div key={dino._id} className="bg-white rounded-lg shadow p-4">
              <input
                className="border mb-1 w-full p-1 rounded"
                value={editDino.name}
                onChange={(e) =>
                  handleEditChange(dino._id, "name", e.target.value)
                }
              />
              <label>
                Tipo:
                <select
                  className="border mb-1 w-full p-1 rounded"
                  value={editDino.type}
                  onChange={(e) =>
                    handleEditChange(dino._id, "type", e.target.value)
                  }
                >
                  <option value="">Selecciona tipo</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Rareza:
                <select
                  className="border mb-1 w-full p-1 rounded"
                  value={editDino.rarity}
                  onChange={(e) =>
                    handleEditChange(dino._id, "rarity", e.target.value)
                  }
                >
                  <option value="">Selecciona rareza</option>
                  {rarities.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Periodo:
                <textarea
                  className="border mb-1 w-full p-1 rounded"
                  value={editDino.period}
                  onChange={(e) =>
                    handleEditChange(dino._id, "period", e.target.value)
                  }
                />
              </label>

              <label>
                Costo:
                <input
                  type="number"
                  className="border mb-1 w-full p-1 rounded"
                  value={editDino.adoptionCost}
                  onChange={(e) =>
                    handleEditChange(
                      dino._id,
                      "adoptionCost",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label>
                Descripcion:
                <textarea
                  className="border mb-1 w-full p-1 rounded"
                  value={editDino.description}
                  onChange={(e) =>
                    handleEditChange(dino._id, "description", e.target.value)
                  }
                />
              </label>

              <p className="text-sm text-gray-600">
                Adoptado por:{" "}
                {typeof dino.adoptedBy === "object" && dino.adoptedBy !== null
                  ? dino.adoptedBy.username
                  : "Disponible"}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => handleSaveEdit(dino._id)}
                >
                  Guardar
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => handleDeleteDino(dino._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPanel;
