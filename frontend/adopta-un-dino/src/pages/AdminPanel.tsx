import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

type AdoptedBy = {
  username: string;
};

type Dino = {
  _id: string;
  name: string;
  type: string;
  rarity: string;
  period: string;
  description: string;
  adoptionCost: number;
  adoptedBy?: string | AdoptedBy | null;
  imageUrl?: string;
};

type User = {
  _id: string;
  username: string;
  role: "admin" | "user";
  points: number;
};

const AdminPanel: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [dinos, setDinos] = useState<Dino[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"add" | "manage" | "users">("add");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDino, setEditingDino] = useState<Dino | null>(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/auth");
    } else {
      loadDinos();
      loadUsers();
    }
  }, [BACKEND_URL, navigate, user]);

  const loadDinos = () => {
    fetch(`${BACKEND_URL}/api/dinos`)
      .then((res) => res.json())
      .then(setDinos)
      .catch((err) => console.error("Error fetching dinos (admin):", err));
  };

  const loadUsers = () => {
    const token = localStorage.getItem("token");
    fetch(`${BACKEND_URL}/api/users/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setUsers)
      .catch((err) => console.error("Error fetching users:", err));
  };

  // Metadata para tipos y rarezas
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dinos/metadata`)
      .then((res) => res.json())
      .then((data) => {
        setTypes(data.types);
        setRarities(data.rarities);
      })
      .catch((err) => console.error("Error fetching metadata:", err));
  }, [BACKEND_URL]);

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

  // Funciones para dinosaurios
  const handleAddDino = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDino),
      });

      if (res.ok) {
        setNewDino({
          name: "",
          type: "",
          rarity: "",
          adoptionCost: 0,
          period: "",
          description: "",
          imageUrl: "",
        });
        loadDinos();
        alert("Dinosaurio agregado con éxito");
      }
    } catch (err) {
      console.error("Error adding dino:", err);
      alert("Error al agregar dinosaurio");
    }
  };

  const handleUpdateDino = async (dinoId: string, updates: Partial<Dino>) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${dinoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        loadDinos();
        setEditingDino(null);
        alert("Dinosaurio actualizado");
      }
    } catch (err) {
      console.error("Error updating dino:", err);
      alert("Error al actualizar dinosaurio");
    }
  };

  const handleDeleteDino = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este dinosaurio?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        loadDinos();
        alert("Dinosaurio eliminado");
      }
    } catch (err) {
      console.error("Error deleting dino:", err);
      alert("Error al eliminar dinosaurio");
    }
  };

  // Funciones para usuarios
  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/admin/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        loadUsers();
        setEditingUser(null);
        alert("Usuario actualizado");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error al actualizar usuario");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/admin/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        loadUsers();
        alert("Usuario eliminado");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error al eliminar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-teal-500 p-4 relative overflow-hidden">
      {/* Patrón de fondo retro */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            #ffffff 2px,
            #ffffff 4px
          )`,
          }}
        ></div>
      </div>

      {/* Ventana principal estilo Windows 98 */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-7xl mx-auto">
        {/* Barra de título */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              ⚙️
            </div>
            <span className="text-sm font-bold">
              DinoAdmin - Panel de Administración v1.0
            </span>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              _
            </div>
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              □
            </div>
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              ×
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-gray-200 border-b border-gray-400 p-2 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-3 py-1 border border-gray-400 ${
              activeTab === "add"
                ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-gray-200"
                : "border-t-white border-l-white border-r-gray-600 border-b-gray-600 bg-gray-300"
            }`}
          >
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              🦕 Agregar Dino
            </span>
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-3 py-1 border border-gray-400 ${
              activeTab === "manage"
                ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-gray-200"
                : "border-t-white border-l-white border-r-gray-600 border-b-gray-600 bg-gray-300"
            }`}
          >
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              📋 Gestionar Dinos
            </span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1 border border-gray-400 ${
              activeTab === "users"
                ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-gray-200"
                : "border-t-white border-l-white border-r-gray-600 border-b-gray-600 bg-gray-300"
            }`}
          >
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              👥 Gestionar Usuarios
            </span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-gray-300 p-6">
          {activeTab === "add" && (
            <div>
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-4 mb-6">
                <h2
                  className="text-xl font-bold text-black text-center"
                  style={{
                    fontFamily: "MS Sans Serif, sans-serif",
                    textShadow: "1px 1px 0px #c0c0c0",
                  }}
                >
                  🦕 AGREGAR NUEVO DINOSAURIO
                </h2>
              </div>

              <form onSubmit={handleAddDino} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-black text-sm font-bold mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      Nombre:
                    </label>
                    <input
                      type="text"
                      value={newDino.name}
                      onChange={(e) =>
                        setNewDino({ ...newDino, name: e.target.value })
                      }
                      required
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-black text-sm font-bold mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      Tipo:
                    </label>
                    <select
                      value={newDino.type}
                      onChange={(e) =>
                        setNewDino({ ...newDino, type: e.target.value })
                      }
                      required
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      <option value="">Seleccionar tipo...</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-black text-sm font-bold mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      Rareza:
                    </label>
                    <select
                      value={newDino.rarity}
                      onChange={(e) =>
                        setNewDino({ ...newDino, rarity: e.target.value })
                      }
                      required
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      <option value="">Seleccionar rareza...</option>
                      {rarities.map((rarity) => (
                        <option key={rarity} value={rarity}>
                          {rarity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-black text-sm font-bold mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      Costo de adopción:
                    </label>
                    <input
                      type="number"
                      value={newDino.adoptionCost}
                      onChange={(e) =>
                        setNewDino({
                          ...newDino,
                          adoptionCost: parseInt(e.target.value),
                        })
                      }
                      required
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-black text-sm font-bold mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      Período:
                    </label>
                    <input
                      type="text"
                      value={newDino.period}
                      onChange={(e) =>
                        setNewDino({ ...newDino, period: e.target.value })
                      }
                      required
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-black text-sm font-bold mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      URL de imagen:
                    </label>
                    <input
                      type="url"
                      value={newDino.imageUrl}
                      onChange={(e) =>
                        setNewDino({ ...newDino, imageUrl: e.target.value })
                      }
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-black text-sm font-bold mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    Descripción:
                  </label>
                  <textarea
                    value={newDino.description}
                    onChange={(e) =>
                      setNewDino({ ...newDino, description: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none resize-none"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ► Agregar Dinosaurio
                </button>
              </form>
            </div>
          )}

          {activeTab === "manage" && (
            <div>
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-4 mb-6">
                <h2
                  className="text-xl font-bold text-black text-center"
                  style={{
                    fontFamily: "MS Sans Serif, sans-serif",
                    textShadow: "1px 1px 0px #c0c0c0",
                  }}
                >
                  📋 GESTIONAR DINOSAURIOS
                </h2>
              </div>

              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <thead>
                      <tr className="bg-gray-200 border-b border-gray-400">
                        <th className="text-left p-2 text-black font-bold">
                          Nombre
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Tipo
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Rareza
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Costo
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Estado
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dinos.map((dino) => (
                        <tr key={dino._id} className="border-b border-gray-300">
                          <td className="p-2 text-black">{dino.name}</td>
                          <td className="p-2 text-black">{dino.type}</td>
                          <td className="p-2 text-black">{dino.rarity}</td>
                          <td className="p-2 text-black">
                            {dino.adoptionCost}
                          </td>
                          <td className="p-2 text-black">
                            {dino.adoptedBy ? "Adoptado" : "Disponible"}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingDino(dino)}
                                className="bg-blue-300 border-2 border-t-white border-l-white border-r-blue-600 border-b-blue-600 px-2 py-1 text-black text-xs font-bold hover:bg-blue-200 active:border-t-blue-600 active:border-l-blue-600 active:border-r-white active:border-b-white"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => handleDeleteDino(dino._id)}
                                className="bg-red-300 border-2 border-t-white border-l-white border-r-red-600 border-b-red-600 px-2 py-1 text-black text-xs font-bold hover:bg-red-200 active:border-t-red-600 active:border-l-red-600 active:border-r-white active:border-b-white"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                ✕ Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-4 mb-6">
                <h2
                  className="text-xl font-bold text-black text-center"
                  style={{
                    fontFamily: "MS Sans Serif, sans-serif",
                    textShadow: "1px 1px 0px #c0c0c0",
                  }}
                >
                  👥 GESTIONAR USUARIOS
                </h2>
              </div>

              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <thead>
                      <tr className="bg-gray-200 border-b border-gray-400">
                        <th className="text-left p-2 text-black font-bold">
                          Usuario
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Rol
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Puntos
                        </th>
                        <th className="text-left p-2 text-black font-bold">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr
                          key={userData._id}
                          className="border-b border-gray-300"
                        >
                          <td className="p-2 text-black">
                            {userData.username}
                          </td>
                          <td className="p-2 text-black">
                            {userData.role === "admin"
                              ? "🔧 Admin"
                              : "👤 Usuario"}
                          </td>
                          <td className="p-2 text-black">{userData.points}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingUser(userData)}
                                className="bg-blue-300 border-2 border-t-white border-l-white border-r-blue-600 border-b-blue-600 px-2 py-1 text-black text-xs font-bold hover:bg-blue-200 active:border-t-blue-600 active:border-l-blue-600 active:border-r-white active:border-b-white"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                ✏️ Editar
                              </button>
                              {userData.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(userData._id)}
                                  className="bg-red-300 border-2 border-t-white border-l-white border-r-red-600 border-b-red-600 px-2 py-1 text-black text-xs font-bold hover:bg-red-200 active:border-t-red-600 active:border-l-red-600 active:border-r-white active:border-b-white"
                                  style={{
                                    fontFamily: "MS Sans Serif, sans-serif",
                                  }}
                                >
                                  ✕ Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición de dinosaurio */}
      {editingDino && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-4 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 mb-4 flex items-center justify-between">
              <span
                className="text-sm font-bold"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                ✏️ Editar Dinosaurio
              </span>
              <button
                onClick={() => setEditingDino(null)}
                className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs text-black font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-black text-sm font-bold mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    Nombre:
                  </label>
                  <input
                    type="text"
                    value={editingDino.name}
                    onChange={(e) =>
                      setEditingDino({ ...editingDino, name: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-black text-sm font-bold mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    Tipo:
                  </label>
                  <select
                    value={editingDino.type}
                    onChange={(e) =>
                      setEditingDino({ ...editingDino, type: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-black text-sm font-bold mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    Rareza:
                  </label>
                  <select
                    value={editingDino.rarity}
                    onChange={(e) =>
                      setEditingDino({ ...editingDino, rarity: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    {rarities.map((rarity) => (
                      <option key={rarity} value={rarity}>
                        {rarity}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-black text-sm font-bold mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    Costo de adopción:
                  </label>
                  <input
                    type="number"
                    value={editingDino.adoptionCost}
                    onChange={(e) =>
                      setEditingDino({
                        ...editingDino,
                        adoptionCost: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-black text-sm font-bold mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    Período:
                  </label>
                  <input
                    type="text"
                    value={editingDino.period}
                    onChange={(e) =>
                      setEditingDino({ ...editingDino, period: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-black text-sm font-bold mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    URL de imagen:
                  </label>
                  <input
                    type="url"
                    value={editingDino.imageUrl || ""}
                    onChange={(e) =>
                      setEditingDino({
                        ...editingDino,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-black text-sm font-bold mb-2"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  Descripción:
                </label>
                <textarea
                  value={editingDino.description}
                  onChange={(e) =>
                    setEditingDino({
                      ...editingDino,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none resize-none"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleUpdateDino(editingDino._id, {
                      name: editingDino.name,
                      type: editingDino.type,
                      rarity: editingDino.rarity,
                      adoptionCost: editingDino.adoptionCost,
                      period: editingDino.period,
                      description: editingDino.description,
                      imageUrl: editingDino.imageUrl,
                    })
                  }
                  className="flex-1 bg-green-300 border-2 border-t-white border-l-white border-r-green-600 border-b-green-600 px-4 py-2 text-black font-bold hover:bg-green-200 active:border-t-green-600 active:border-l-green-600 active:border-r-white active:border-b-white"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ✓ Guardar Cambios
                </button>
                <button
                  onClick={() => setEditingDino(null)}
                  className="flex-1 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de usuario */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-4 max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 mb-4 flex items-center justify-between">
              <span
                className="text-sm font-bold"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                ✏️ Editar Usuario
              </span>
              <button
                onClick={() => setEditingUser(null)}
                className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs text-black font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-black text-sm font-bold mb-2"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  Puntos:
                </label>
                <input
                  type="number"
                  value={editingUser.points}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                />
              </div>

              <div>
                <label
                  className="block text-black text-sm font-bold mb-2"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  Rol:
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as "admin" | "user",
                    })
                  }
                  className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleUpdateUser(editingUser._id, {
                      points: editingUser.points,
                      role: editingUser.role,
                    })
                  }
                  className="flex-1 bg-green-300 border-2 border-t-white border-l-white border-r-green-600 border-b-green-600 px-4 py-2 text-black font-bold hover:bg-green-200 active:border-t-green-600 active:border-l-green-600 active:border-r-white active:border-b-white"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ✓ Guardar
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
