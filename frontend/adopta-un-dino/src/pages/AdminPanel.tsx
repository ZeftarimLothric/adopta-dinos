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

  // Obtener color de rareza
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "común":
        return "text-gray-600";
      case "raro":
        return "text-blue-600";
      case "épico":
        return "text-purple-600";
      case "legendario":
        return "text-orange-600";
      default:
        return "text-black";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 p-2 sm:p-4 relative overflow-hidden">
      {/* Patrón de fondo retro - oculto en móvil */}
      <div className="absolute inset-0 opacity-10 hidden sm:block">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                #ffffff 20px,
                #ffffff 22px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 20px,
                #ffffff 20px,
                #ffffff 22px
              )
            `,
          }}
        ></div>
      </div>

      {/* Decoraciones flotantes - ocultas en móvil */}
      <div className="hidden sm:block absolute top-10 left-10 text-4xl lg:text-6xl opacity-20 animate-bounce">
        🦕
      </div>
      <div className="hidden sm:block absolute top-20 right-20 text-3xl lg:text-4xl opacity-20 animate-pulse">
        🦴
      </div>
      <div className="hidden sm:block absolute bottom-20 left-20 text-3xl lg:text-5xl opacity-20 animate-pulse">
        🌿
      </div>
      <div className="hidden sm:block absolute bottom-10 right-10 text-3xl lg:text-4xl opacity-20 animate-bounce">
        🥚
      </div>

      {/* Ventana principal estilo Windows 98 - responsiva */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-7xl mx-auto shadow-2xl">
        {/* Barra de título responsiva */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-1 sm:gap-3 min-w-0">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-300 border-2 border-gray-600 flex items-center justify-center text-xs font-bold text-black rounded-sm shadow-inner flex-shrink-0">
              ⚙️
            </div>
            <span
              className="text-xs sm:text-sm font-bold tracking-wide truncate"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden sm:inline">
                DinoAdmin v2.0 - Panel de Administración Avanzado
              </span>
              <span className="sm:hidden">DinoAdmin v2.0</span>
            </span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-3 h-3 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer">
              _
            </div>
            <div className="w-3 h-3 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer">
              □
            </div>
            <div className="w-3 h-3 sm:w-5 sm:h-5 bg-red-500 border border-red-700 flex items-center justify-center text-xs text-white hover:bg-red-400 cursor-pointer">
              ×
            </div>
          </div>
        </div>

        {/* Barra de estado responsiva */}
        <div className="bg-gray-200 border-b border-gray-400 px-2 sm:px-4 py-2">
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="text-black">
                👤 <span className="hidden sm:inline">Admin: </span>
                <strong>{user?.username}</strong>
              </span>
              <span className="text-black">
                🦕 <strong>{dinos.length}</strong>
                <span className="hidden sm:inline"> dinos</span>
              </span>
              <span className="text-black">
                👥 <strong>{users.length}</strong>
                <span className="hidden sm:inline"> usuarios</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-bold">
                <span className="hidden sm:inline">Sistema Activo</span>
                <span className="sm:hidden">Online</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas responsivas */}
        <div className="bg-gray-200 border-b-2 border-gray-400 p-1 sm:p-2 flex items-center gap-1 overflow-x-auto">
          {[
            {
              id: "add",
              icon: "🦕",
              label: "Agregar",
              labelFull: "Agregar Dino",
            },
            {
              id: "manage",
              icon: "📋",
              label: "Gestionar",
              labelFull: "Gestionar Dinos",
            },
            {
              id: "users",
              icon: "👥",
              label: "Usuarios",
              labelFull: "Gestionar Usuarios",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2 sm:px-4 py-1 sm:py-2 border-2 transition-all duration-200 flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-gray-300 shadow-inner"
                  : "border-t-white border-l-white border-r-gray-600 border-b-gray-600 bg-gray-200 hover:bg-gray-100 shadow-md"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">{tab.icon}</span>
                <span
                  className="text-xs font-bold text-black"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  <span className="hidden sm:inline">{tab.labelFull}</span>
                  <span className="sm:hidden">{tab.label}</span>
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Contenido principal responsivo */}
        <div className="bg-gray-300 p-3 sm:p-6 min-h-[400px] sm:min-h-[600px]">
          {activeTab === "add" && (
            <div>
              <div className="bg-gradient-to-r from-green-200 to-green-300 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-4 mb-3 sm:mb-6 shadow-lg">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-3xl">🦕</span>
                  <h2
                    className="text-sm sm:text-xl font-bold text-black"
                    style={{
                      fontFamily: "MS Sans Serif, sans-serif",
                      textShadow: "1px 1px 0px #c0c0c0",
                    }}
                  >
                    <span className="hidden sm:inline">
                      AGREGAR NUEVO DINOSAURIO
                    </span>
                    <span className="sm:hidden">AGREGAR DINO</span>
                  </h2>
                  <span className="text-xl sm:text-3xl">🦴</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-6 shadow-lg">
                <form
                  onSubmit={handleAddDino}
                  className="space-y-3 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label
                        className="block text-black text-xs sm:text-sm font-bold"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        🏷️ Nombre:
                      </label>
                      <input
                        type="text"
                        value={newDino.name}
                        onChange={(e) =>
                          setNewDino({ ...newDino, name: e.target.value })
                        }
                        required
                        className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg transition-shadow"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        placeholder="Ej: Tyrannosaurus Rex"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <label
                        className="block text-black text-xs sm:text-sm font-bold"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        🦖 Tipo:
                      </label>
                      <select
                        value={newDino.type}
                        onChange={(e) =>
                          setNewDino({ ...newDino, type: e.target.value })
                        }
                        required
                        className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg transition-shadow"
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

                    <div className="space-y-1 sm:space-y-2">
                      <label
                        className="block text-black text-xs sm:text-sm font-bold"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        ✨ Rareza:
                      </label>
                      <select
                        value={newDino.rarity}
                        onChange={(e) =>
                          setNewDino({ ...newDino, rarity: e.target.value })
                        }
                        required
                        className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg transition-shadow"
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

                    <div className="space-y-1 sm:space-y-2">
                      <label
                        className="block text-black text-xs sm:text-sm font-bold"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        💰 Costo:
                      </label>
                      <input
                        type="number"
                        value={newDino.adoptionCost}
                        onChange={(e) =>
                          setNewDino({
                            ...newDino,
                            adoptionCost: parseInt(e.target.value) || 0,
                          })
                        }
                        required
                        min="0"
                        className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg transition-shadow"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        placeholder="100"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <label
                        className="block text-black text-xs sm:text-sm font-bold"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        🕰️ Período:
                      </label>
                      <input
                        type="text"
                        value={newDino.period}
                        onChange={(e) =>
                          setNewDino({ ...newDino, period: e.target.value })
                        }
                        required
                        className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg transition-shadow"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        placeholder="Ej: Cretácico"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <label
                        className="block text-black text-xs sm:text-sm font-bold"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        🖼️ <span className="hidden sm:inline">URL imagen:</span>
                        <span className="sm:hidden">Imagen:</span>
                      </label>
                      <input
                        type="url"
                        value={newDino.imageUrl}
                        onChange={(e) =>
                          setNewDino({ ...newDino, imageUrl: e.target.value })
                        }
                        className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg transition-shadow"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label
                      className="block text-black text-xs sm:text-sm font-bold"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      📝 Descripción:
                    </label>
                    <textarea
                      value={newDino.description}
                      onChange={(e) =>
                        setNewDino({ ...newDino, description: e.target.value })
                      }
                      required
                      rows={3}
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none resize-none focus:shadow-lg transition-shadow"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      placeholder="Describe las características principales del dinosaurio..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-300 to-green-400 border-2 border-t-white border-l-white border-r-green-600 border-b-green-600 px-3 sm:px-6 py-2 sm:py-3 text-black font-bold hover:from-green-200 hover:to-green-300 active:border-t-green-600 active:border-l-green-600 active:border-r-white active:border-b-white transition-all duration-200 shadow-lg hover:shadow-xl text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-sm sm:text-lg">🦕</span>
                      <span>
                        <span className="hidden sm:inline">
                          AGREGAR DINOSAURIO
                        </span>
                        <span className="sm:hidden">AGREGAR</span>
                      </span>
                      <span className="text-sm sm:text-lg">➕</span>
                    </span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "manage" && (
            <div>
              <div className="bg-gradient-to-r from-blue-200 to-blue-300 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-4 mb-3 sm:mb-6 shadow-lg">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-3xl">📋</span>
                  <h2
                    className="text-sm sm:text-xl font-bold text-black"
                    style={{
                      fontFamily: "MS Sans Serif, sans-serif",
                      textShadow: "1px 1px 0px #c0c0c0",
                    }}
                  >
                    <span className="hidden sm:inline">
                      GESTIONAR DINOSAURIOS ({dinos.length})
                    </span>
                    <span className="sm:hidden">DINOS ({dinos.length})</span>
                  </h2>
                  <span className="text-xl sm:text-3xl">🦖</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-2 sm:p-4 shadow-lg">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-xs sm:text-sm min-w-full"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-200 to-gray-300 border-b-2 border-gray-400">
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 min-w-28">
                          🏷️ Nombre
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 hidden sm:table-cell">
                          🦖 Tipo
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400">
                          ✨ Rareza
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 hidden md:table-cell">
                          💰 Costo
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 hidden lg:table-cell">
                          📊 Estado
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold">
                          🔧 Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dinos.map((dino, index) => (
                        <tr
                          key={dino._id}
                          className={`border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="p-2 sm:p-3 text-black border-r border-gray-200">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-sm sm:text-lg">🦕</span>
                              <div className="min-w-0">
                                <strong className="text-xs sm:text-sm block truncate">
                                  {dino.name}
                                </strong>
                                <span className="text-xs text-gray-600 sm:hidden">
                                  {dino.type}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 text-black border-r border-gray-200 hidden sm:table-cell">
                            {dino.type}
                          </td>
                          <td
                            className={`p-2 sm:p-3 border-r border-gray-200 font-bold ${getRarityColor(
                              dino.rarity
                            )}`}
                          >
                            <span className="hidden sm:inline">
                              {dino.rarity}
                            </span>
                            <span className="sm:hidden text-xs">
                              {dino.rarity.slice(0, 3)}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 text-black border-r border-gray-200 hidden md:table-cell">
                            <span className="bg-yellow-200 px-1 sm:px-2 py-1 rounded border border-yellow-400 text-xs">
                              {dino.adoptionCost}
                              <span className="hidden sm:inline"> pts</span>
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 border-r border-gray-200 hidden lg:table-cell">
                            {dino.adoptedBy ? (
                              <span className="bg-red-200 text-red-800 px-2 py-1 rounded border border-red-400 text-xs font-bold">
                                🏠 Adoptado
                              </span>
                            ) : (
                              <span className="bg-green-200 text-green-800 px-2 py-1 rounded border border-green-400 text-xs font-bold">
                                ✅ Disponible
                              </span>
                            )}
                          </td>
                          <td className="p-2 sm:p-3">
                            <div className="flex flex-col sm:flex-row gap-1">
                              <button
                                onClick={() => setEditingDino(dino)}
                                className="bg-gradient-to-r from-blue-300 to-blue-400 border-2 border-t-white border-l-white border-r-blue-600 border-b-blue-600 px-1 sm:px-3 py-1 text-black text-xs font-bold hover:from-blue-200 hover:to-blue-300 active:border-t-blue-600 active:border-l-blue-600 active:border-r-white active:border-b-white transition-all shadow-md"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                ✏️{" "}
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDino(dino._id)}
                                className="bg-gradient-to-r from-red-300 to-red-400 border-2 border-t-white border-l-white border-r-red-600 border-b-red-600 px-1 sm:px-3 py-1 text-black text-xs font-bold hover:from-red-200 hover:to-red-300 active:border-t-red-600 active:border-l-red-600 active:border-r-white active:border-b-white transition-all shadow-md"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                🗑️{" "}
                                <span className="hidden sm:inline">
                                  Eliminar
                                </span>
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
              <div className="bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-4 mb-3 sm:mb-6 shadow-lg">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-3xl">👥</span>
                  <h2
                    className="text-sm sm:text-xl font-bold text-black"
                    style={{
                      fontFamily: "MS Sans Serif, sans-serif",
                      textShadow: "1px 1px 0px #c0c0c0",
                    }}
                  >
                    <span className="hidden sm:inline">
                      GESTIONAR USUARIOS ({users.length})
                    </span>
                    <span className="sm:hidden">USUARIOS ({users.length})</span>
                  </h2>
                  <span className="text-xl sm:text-3xl">👤</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-2 sm:p-4 shadow-lg">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-xs sm:text-sm min-w-full"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-200 to-gray-300 border-b-2 border-gray-400">
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 min-w-24">
                          👤 Usuario
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 hidden sm:table-cell">
                          🔧 Rol
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400">
                          💎 Puntos
                        </th>
                        <th className="text-left p-2 sm:p-3 text-black font-bold">
                          ⚙️ Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData, index) => (
                        <tr
                          key={userData._id}
                          className={`border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="p-2 sm:p-3 text-black border-r border-gray-200">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-sm sm:text-lg">
                                {userData.role === "admin" ? "👑" : "👤"}
                              </span>
                              <div className="min-w-0">
                                <strong className="text-xs sm:text-sm block truncate">
                                  {userData.username}
                                </strong>
                                <span className="text-xs text-gray-600 sm:hidden">
                                  {userData.role === "admin"
                                    ? "Admin"
                                    : "Usuario"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 border-r border-gray-200 hidden sm:table-cell">
                            {userData.role === "admin" ? (
                              <span className="bg-red-200 text-red-800 px-2 py-1 rounded border border-red-400 text-xs font-bold">
                                🔧 Admin
                              </span>
                            ) : (
                              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-400 text-xs font-bold">
                                👤 Usuario
                              </span>
                            )}
                          </td>
                          <td className="p-2 sm:p-3 text-black border-r border-gray-200">
                            <span className="bg-yellow-200 px-1 sm:px-2 py-1 rounded border border-yellow-400 font-bold text-xs">
                              💎 {userData.points}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3">
                            <div className="flex flex-col sm:flex-row gap-1">
                              <button
                                onClick={() => setEditingUser(userData)}
                                className="bg-gradient-to-r from-blue-300 to-blue-400 border-2 border-t-white border-l-white border-r-blue-600 border-b-blue-600 px-1 sm:px-3 py-1 text-black text-xs font-bold hover:from-blue-200 hover:to-blue-300 active:border-t-blue-600 active:border-l-blue-600 active:border-r-white active:border-b-white transition-all shadow-md"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                ✏️{" "}
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                              {userData.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(userData._id)}
                                  className="bg-gradient-to-r from-red-300 to-red-400 border-2 border-t-white border-l-white border-r-red-600 border-b-red-600 px-1 sm:px-3 py-1 text-black text-xs font-bold hover:from-red-200 hover:to-red-300 active:border-t-red-600 active:border-l-red-600 active:border-r-white active:border-b-white transition-all shadow-md"
                                  style={{
                                    fontFamily: "MS Sans Serif, sans-serif",
                                  }}
                                >
                                  🗑️{" "}
                                  <span className="hidden sm:inline">
                                    Eliminar
                                  </span>
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

      {/* Modales responsivos */}
      {editingDino && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2">
          <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-2 sm:p-4 max-w-xs sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 mb-2 sm:mb-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">✏️</span>
                <span
                  className="text-xs sm:text-sm font-bold truncate"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  <span className="hidden sm:inline">Editar Dinosaurio: </span>
                  {editingDino.name}
                </span>
              </div>
              <button
                onClick={() => setEditingDino(null)}
                className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 border border-red-700 flex items-center justify-center text-xs text-white font-bold hover:bg-red-400"
              >
                ×
              </button>
            </div>

            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label
                      className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🏷️ Nombre:
                    </label>
                    <input
                      type="text"
                      value={editingDino.name}
                      onChange={(e) =>
                        setEditingDino({ ...editingDino, name: e.target.value })
                      }
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🦖 Tipo:
                    </label>
                    <select
                      value={editingDino.type}
                      onChange={(e) =>
                        setEditingDino({ ...editingDino, type: e.target.value })
                      }
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
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
                      className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      ✨ Rareza:
                    </label>
                    <select
                      value={editingDino.rarity}
                      onChange={(e) =>
                        setEditingDino({
                          ...editingDino,
                          rarity: e.target.value,
                        })
                      }
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
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
                      className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      💰 Costo:
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
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🕰️ Período:
                    </label>
                    <input
                      type="text"
                      value={editingDino.period}
                      onChange={(e) =>
                        setEditingDino({
                          ...editingDino,
                          period: e.target.value,
                        })
                      }
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🖼️ <span className="hidden sm:inline">URL imagen:</span>
                      <span className="sm:hidden">Imagen:</span>
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
                      className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    📝 Descripción:
                  </label>
                  <textarea
                    value={editingDino.description}
                    onChange={(e) =>
                      setEditingDino({
                        ...editingDino,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none resize-none focus:shadow-lg"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
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
                    className="flex-1 bg-gradient-to-r from-green-300 to-green-400 border-2 border-t-white border-l-white border-r-green-600 border-b-green-600 px-2 sm:px-4 py-2 text-black font-bold hover:from-green-200 hover:to-green-300 active:border-t-green-600 active:border-l-green-600 active:border-r-white active:border-b-white transition-all shadow-lg text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    ✓ <span className="hidden sm:inline">Guardar Cambios</span>
                    <span className="sm:hidden">Guardar</span>
                  </button>
                  <button
                    onClick={() => setEditingDino(null)}
                    className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 sm:px-4 py-2 text-black font-bold hover:from-gray-200 hover:to-gray-300 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all shadow-lg text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2">
          <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-2 sm:p-4 max-w-xs sm:max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white px-2 sm:px-3 py-1 sm:py-2 mb-2 sm:mb-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">✏️</span>
                <span
                  className="text-xs sm:text-sm font-bold truncate"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  <span className="hidden sm:inline">Editar Usuario: </span>
                  {editingUser.username}
                </span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 border border-red-700 flex items-center justify-center text-xs text-white font-bold hover:bg-red-400"
              >
                ×
              </button>
            </div>

            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label
                    className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    💎 Puntos:
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
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    🔧 Rol:
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as "admin" | "user",
                      })
                    }
                    className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-2 sm:px-3 py-1 sm:py-2 text-black text-xs sm:text-sm focus:outline-none focus:shadow-lg"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <option value="user">👤 Usuario</option>
                    <option value="admin">👑 Administrador</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <button
                    onClick={() =>
                      handleUpdateUser(editingUser._id, {
                        points: editingUser.points,
                        role: editingUser.role,
                      })
                    }
                    className="flex-1 bg-gradient-to-r from-green-300 to-green-400 border-2 border-t-white border-l-white border-r-green-600 border-b-green-600 px-2 sm:px-4 py-2 text-black font-bold hover:from-green-200 hover:to-green-300 active:border-t-green-600 active:border-l-green-600 active:border-r-white active:border-b-white transition-all shadow-lg text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    ✓ Guardar
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 sm:px-4 py-2 text-black font-bold hover:from-gray-200 hover:to-gray-300 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all shadow-lg text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
