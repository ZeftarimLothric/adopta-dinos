// src/pages/Adopciones.tsx
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../context/UserContext";

interface AdoptedBy {
  _id: string;
  username: string;
}

interface Dinosaur {
  _id: string;
  name: string;
  type: string;
  period: string;
  adoptionCost: number;
  description?: string | null;
  rarity: string;
  adoptedBy?: AdoptedBy | null;
}

interface AdoptResponse {
  message: string;
  dino: Dinosaur;
  remainingPoints: number;
}

interface JwtPayload {
  id: string;
}

const rarityColors: Record<string, string> = {
  Common: "bg-green-100 text-green-800",
  Rare: "bg-yellow-100 text-yellow-800",
  Legendary: "bg-red-100 text-red-800",
};

const Adopciones = () => {
  const { user, updateUser, token } = useUser();
  const [dinos, setDinos] = useState<Dinosaur[]>([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Obtener el id de usuario desde el token JWT guardado en localStorage
  let currentUserId = "";
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      currentUserId = decoded.id;
    } catch (error) {
      console.error("Error al decodificar token:", error);
    }
  }

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dinos`)
      .then((res) => res.json())
      .then((data: Dinosaur[]) => setDinos(data))
      .catch((err) => console.error("Error fetching dinos:", err));
  }, [BACKEND_URL]);

  const handleReleaseDino = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${id}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Error al liberar dinosaurio");

      const data = await res.json();
      setDinos((prev) => prev.map((d) => (d._id === id ? data.dino : d)));
    } catch (error) {
      console.error("Error liberando dinosaurio:", error);
    }
  };

  const handleAdoptDino = async (id: string) => {
    const dino = dinos.find((d) => d._id === id);
    if (!dino || !user) return alert("Datos insuficientes");

    if (user.points < dino.adoptionCost) {
      return alert(
        "No tienes suficientes puntos para adoptar este dinosaurio."
      );
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${id}/adopt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al adoptar");

      const data: AdoptResponse = await res.json();

      // Actualizo lista de dinos
      setDinos((prev) => prev.map((d) => (d._id === id ? data.dino : d)));
      // Actualizo puntos en el contexto
      updateUser({ ...user, points: data.remainingPoints });
    } catch (err) {
      console.error("Error al adoptar:", err);
      alert("No se pudo completar la adopción.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
      <h1 className="text-5xl font-bold text-center text-indigo-800 mb-10 drop-shadow">
        🦕 Elige tu Compañero Prehistórico
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {dinos.map((dino) => (
          <div
            key={dino._id}
            className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-indigo-300 hover:scale-105 transform transition duration-300"
          >
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">
              {dino.name}
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Tipo:</span> {dino.type}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Perido:</span>{" "}
              {dino.period ?? "Desconocido"}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Descripcion:</span>{" "}
              {dino.description ?? "No disponible"}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Dinopoints necesarios:</span>{" "}
              {dino.adoptionCost ?? "No disponible"}
            </p>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full font-semibold mt-2 mb-4 ${
                rarityColors[dino.rarity] ?? "bg-gray-200 text-gray-700"
              }`}
            >
              {dino.rarity}
            </span>

            <p className="text-sm text-gray-500 italic">
              {dino.adoptedBy
                ? `Adoptado por: ${dino.adoptedBy.username}`
                : "Disponible"}
            </p>

            {!dino.adoptedBy && (
              <button
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                onClick={() => handleAdoptDino(dino._id)}
              >
                Adoptar
              </button>
            )}

            {dino.adoptedBy && dino.adoptedBy._id === currentUserId && (
              <button
                className="mt-2 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                onClick={() => handleReleaseDino(dino._id)}
              >
                Liberar dinosaurio
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Adopciones;
