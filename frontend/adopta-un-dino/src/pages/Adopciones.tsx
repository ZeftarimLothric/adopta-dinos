import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../context/UserContext";
import { useNotifications } from "../hooks/useNotifications";
import Windows98Dialog from "../components/Windows98Dialog";
import Windows98Notification from "../components/Windows98Notification";

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
  imageUrl?: string;
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
  Común: "bg-gray-200 text-gray-800 border-gray-400",
  Raro: "bg-blue-200 text-blue-800 border-blue-400",
  Épico: "bg-purple-200 text-purple-800 border-purple-400",
  Legendario: "bg-orange-200 text-orange-800 border-orange-400",
  Common: "bg-gray-200 text-gray-800 border-gray-400",
  Rare: "bg-blue-200 text-blue-800 border-blue-400",
  Epic: "bg-purple-200 text-purple-800 border-purple-400",
  Legendary: "bg-orange-200 text-orange-800 border-orange-400",
};

const rarityEmojis: Record<string, string> = {
  Común: "⚪",
  Raro: "🔵",
  Épico: "🟣",
  Legendario: "🟠",
  Common: "⚪",
  Rare: "🔵",
  Epic: "🟣",
  Legendary: "🟠",
};

const typeEmojis: Record<string, string> = {
  Carnívoro: "🦖",
  Herbívoro: "🦕",
  Omnívoro: "🦴",
  Volador: "🦅",
  Acuático: "🐊",
  Carnivore: "🦖",
  Herbivore: "🦕",
  Omnivore: "🦴",
  Flying: "🦅",
  Aquatic: "🐊",
};

const Adopciones = () => {
  const { user, updateUser, token } = useUser();
  const [dinos, setDinos] = useState<Dinosaur[]>([]);
  const [selectedDino, setSelectedDino] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"icons" | "list">("icons");
  const [dialogState, setDialogState] = useState<{
    show: boolean;
    type: "adopt" | "release";
    dino: Dinosaur | null;
  }>({ show: false, type: "adopt", dino: null });

  const { notifications, removeNotification, success, error, warning } =
    useNotifications();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
      .catch((err) => {
        console.error("Error fetching dinos:", err);
        error("Error al cargar la lista de dinosaurios");
      });
  }, [BACKEND_URL]);

  const handleReleaseDino = async (dino: Dinosaur) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${dino._id}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Error al liberar dinosaurio");

      const data = await res.json();
      setDinos((prev) => prev.map((d) => (d._id === dino._id ? data.dino : d)));
      success(
        `¡${dino.name} ha sido liberado exitosamente! Ahora puede ser adoptado por otros usuarios.`
      );
      setDialogState({ show: false, type: "adopt", dino: null });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("Error desconocido:", error);
      }
    }
  };

  const handleAdoptDino = async (dino: Dinosaur) => {
    if (!user) {
      error("Error: Datos de usuario no disponibles");
      return;
    }

    if (user.points < dino.adoptionCost) {
      warning(
        `Necesitas ${dino.adoptionCost} DinoPoints para adoptar a ${dino.name}. Actualmente tienes ${user.points} DinoPoints.`
      );
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${dino._id}/adopt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al adoptar");

      const data: AdoptResponse = await res.json();

      setDinos((prev) => prev.map((d) => (d._id === dino._id ? data.dino : d)));
      updateUser({ ...user, points: data.remainingPoints });
      success(
        `¡Felicidades! Has adoptado a ${dino.name}. Te quedan ${data.remainingPoints} DinoPoints.`
      );
      setDialogState({ show: false, type: "adopt", dino: null });
    } catch (err) {
      console.error("Error al adoptar:", err);
      error(
        `No se pudo completar la adopción de ${dino.name}. Por favor, inténtalo de nuevo.`
      );
    }
  };

  const showAdoptDialog = (dino: Dinosaur) => {
    setDialogState({ show: true, type: "adopt", dino });
  };

  const showReleaseDialog = (dino: Dinosaur) => {
    setDialogState({ show: true, type: "release", dino });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 p-2 sm:p-4 pb-16 relative overflow-hidden">
      {/* Patrón de fondo mejorado */}
      <div className="absolute inset-0 opacity-15">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 25px,
                #ffffff 25px,
                #ffffff 27px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 25px,
                #ffffff 25px,
                #ffffff 27px
              )
            `,
          }}
        ></div>
      </div>

      {/* Decoraciones flotantes animadas - ocultas en móvil */}
      <div className="hidden sm:block absolute top-10 left-10 text-4xl lg:text-6xl opacity-20 animate-bounce">
        🦕
      </div>
      <div className="hidden sm:block absolute top-20 right-20 text-3xl lg:text-5xl opacity-15 animate-pulse">
        🦖
      </div>
      <div
        className="hidden sm:block absolute bottom-32 left-16 text-2xl lg:text-4xl opacity-20 animate-bounce"
        style={{ animationDelay: "1s" }}
      >
        🥚
      </div>
      <div
        className="hidden sm:block absolute bottom-20 right-16 text-3xl lg:text-5xl opacity-15 animate-pulse"
        style={{ animationDelay: "2s" }}
      >
        🦴
      </div>

      {/* Ventana principal responsiva */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-7xl mx-auto shadow-2xl">
        {/* Barra de título responsive */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white px-2 sm:px-3 py-2 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 border-2 border-gray-600 flex items-center justify-center text-xs sm:text-sm font-bold text-black rounded-sm shadow-inner flex-shrink-0">
              🦕
            </div>
            <span
              className="text-xs sm:text-sm font-bold tracking-wide truncate"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden sm:inline">
                Centro de Adopción Prehistórica - DinoManager Pro v3.0
              </span>
              <span className="sm:hidden">DinoManager v3.0</span>
            </span>
            <div className="hidden sm:block bg-blue-900 px-2 py-1 rounded text-xs border border-blue-700 flex-shrink-0">
              PREMIUM
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer transition-colors">
              _
            </div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer transition-colors">
              □
            </div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 border border-red-700 flex items-center justify-center text-xs text-white hover:bg-red-400 cursor-pointer transition-colors">
              ×
            </div>
          </div>
        </div>

        {/* Barra de menú simplificada para móvil */}
        <div className="bg-gray-200 border-b border-gray-400 p-1 flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { icon: "📁", label: "Archivo" },
              { icon: "📋", label: "Ver" },
              { icon: "🔧", label: "Config" },
            ].map((menu) => (
              <div key={menu.label} className="relative group flex-shrink-0">
                <div className="bg-gray-200 hover:bg-gray-100 border border-transparent hover:border-gray-400 hover:border-t-white hover:border-l-white hover:border-r-gray-600 hover:border-b-gray-600 px-2 sm:px-3 py-1 cursor-pointer transition-all">
                  <span
                    className="text-xs font-bold text-black flex items-center gap-1"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    {menu.icon}{" "}
                    <span className="hidden sm:inline">{menu.label}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="bg-gray-300 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 sm:px-3 py-1">
              <span
                className="text-xs text-black font-bold flex items-center gap-1"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🦕 <span className="hidden sm:inline">{dinos.length}</span>
              </span>
            </div>
            {user && (
              <div className="bg-yellow-200 border-2 border-yellow-400 border-t-yellow-600 border-l-yellow-600 border-r-yellow-200 border-b-yellow-200 px-2 sm:px-3 py-1">
                <span
                  className="text-xs text-black font-bold flex items-center gap-1"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  💎 {user.points}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de herramientas responsive */}
        <div className="bg-gray-200 border-b border-gray-400 p-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {/* Controles principales */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Modos de vista */}
              <div className="flex items-center gap-1">
                <span
                  className="text-xs font-bold text-black mr-1 sm:mr-2"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  <span className="hidden sm:inline">Vista:</span>
                  <span className="sm:hidden">📋</span>
                </span>
                <button
                  onClick={() => setViewMode("icons")}
                  className={`px-2 sm:px-3 py-1 text-xs border-2 transition-all ${
                    viewMode === "icons"
                      ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-gray-300 shadow-inner"
                      : "border-t-white border-l-white border-r-gray-600 border-b-gray-600 bg-gray-200 hover:bg-gray-100"
                  }`}
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  🖼️ <span className="hidden sm:inline">Iconos</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2 sm:px-3 py-1 text-xs border-2 transition-all ${
                    viewMode === "list"
                      ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-gray-300 shadow-inner"
                      : "border-t-white border-l-white border-r-gray-600 border-b-gray-600 bg-gray-200 hover:bg-gray-100"
                  }`}
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  📋 <span className="hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Área de contenido principal */}
        <div className="bg-gray-300 p-2 sm:p-4">
          {/* Header informativo responsive */}
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 mb-4 shadow-lg">
            <div className="text-center">
              <h1
                className="text-lg sm:text-2xl font-bold text-black mb-2 flex items-center justify-center gap-2 sm:gap-3"
                style={{
                  fontFamily: "MS Sans Serif, sans-serif",
                  textShadow: "1px 1px 0px #c0c0c0",
                }}
              >
                🦕{" "}
                <span className="hidden sm:inline">
                  CENTRO DE ADOPCIÓN PREHISTÓRICA
                </span>
                <span className="sm:hidden">ADOPCIÓN DINOS</span> 🦖
              </h1>
              <p
                className="text-xs sm:text-sm text-black mb-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="hidden sm:inline">
                  Encuentra tu compañero prehistórico ideal. Cada dinosaurio
                  necesita un hogar lleno de amor.
                </span>
                <span className="sm:hidden">
                  Encuentra y adopta tu dinosaurio ideal
                </span>
              </p>
              <div
                className="flex justify-center gap-2 sm:gap-4 text-xs flex-wrap"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="text-gray-600">
                  🏠 {dinos.filter((d) => d.adoptedBy).length}
                  <span className="hidden sm:inline"> adoptados</span>
                </span>
                <span className="text-gray-600">
                  ✅ {dinos.filter((d) => !d.adoptedBy).length}
                  <span className="hidden sm:inline"> disponibles</span>
                </span>
                <span className="text-gray-600">
                  👤{" "}
                  {
                    dinos.filter((d) => d.adoptedBy?._id === currentUserId)
                      .length
                  }
                  <span className="hidden sm:inline"> míos</span>
                </span>
              </div>
            </div>
          </div>

          {/* Lista de dinosaurios responsive */}
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 shadow-lg">
            {viewMode === "icons" ? (
              /* Vista de iconos responsive */
              <div className="p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4">
                  {dinos.map((dino) => (
                    <div
                      key={dino._id}
                      className={`relative bg-gray-200 border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg ${
                        selectedDino === dino._id
                          ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-blue-200 shadow-inner"
                          : "border-t-white border-l-white border-r-gray-600 border-b-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        setSelectedDino(
                          selectedDino === dino._id ? null : dino._id
                        )
                      }
                    >
                      {/* Badge de rareza responsive */}
                      <div className="absolute top-1 right-1 z-10">
                        <div
                          className={`px-1 sm:px-2 py-1 text-xs border ${
                            rarityColors[dino.rarity] ??
                            "bg-gray-200 text-gray-700 border-gray-400"
                          } shadow-sm`}
                          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        >
                          {rarityEmojis[dino.rarity] ?? "⚫"}
                          <span className="hidden sm:inline">
                            {" "}
                            {dino.rarity}
                          </span>
                        </div>
                      </div>

                      {/* Imagen del dinosaurio responsive */}
                      <div className="p-2 sm:p-4">
                        <div className="relative">
                          {dino.imageUrl ? (
                            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto border-2 border-gray-400 bg-white overflow-hidden shadow-md">
                              <img
                                src={dino.imageUrl}
                                alt={dino.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                              <div className="hidden w-full h-full flex items-center justify-center text-2xl sm:text-4xl bg-gray-100">
                                {typeEmojis[dino.type] ?? "🦕"}
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto border-2 border-gray-400 bg-white flex items-center justify-center text-2xl sm:text-4xl shadow-md">
                              {typeEmojis[dino.type] ?? "🦕"}
                            </div>
                          )}

                          {/* Indicador de estado responsive */}
                          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2">
                            {dino.adoptedBy ? (
                              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-xs text-white shadow-md">
                                🏠
                              </div>
                            ) : (
                              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-xs text-white shadow-md">
                                ✅
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Información básica responsive */}
                        <div className="text-center mt-2 sm:mt-3">
                          <h3
                            className="text-xs sm:text-sm font-bold text-black mb-1 truncate"
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            {dino.name}
                          </h3>
                          <p
                            className="text-xs text-gray-700 mb-2"
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            {typeEmojis[dino.type] ?? "🦕"}
                            <span className="hidden sm:inline">
                              {" "}
                              {dino.type}
                            </span>
                          </p>

                          {/* Costo responsive */}
                          <div className="bg-yellow-200 border border-yellow-400 px-1 sm:px-2 py-1 inline-block mb-2">
                            <span
                              className="text-xs font-bold text-black"
                              style={{
                                fontFamily: "MS Sans Serif, sans-serif",
                              }}
                            >
                              💰 {dino.adoptionCost}
                              <span className="hidden sm:inline"> pts</span>
                            </span>
                          </div>

                          {/* Estado detallado responsive */}
                          <div
                            className="text-xs"
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            {dino.adoptedBy ? (
                              <span className="text-red-700 flex items-center justify-center gap-1">
                                🏠{" "}
                                <span className="hidden sm:inline">
                                  Adoptado por {dino.adoptedBy.username}
                                </span>
                                <span className="sm:hidden">Adoptado</span>
                              </span>
                            ) : (
                              <span className="text-green-700 flex items-center justify-center gap-1">
                                ✅{" "}
                                <span className="hidden sm:inline">
                                  Disponible para adopción
                                </span>
                                <span className="sm:hidden">Disponible</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Panel expandido responsive */}
                      {selectedDino === dino._id && (
                        <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 z-20 shadow-xl min-w-72 sm:min-w-80">
                          <div className="space-y-3">
                            {/* Información detallada responsive */}
                            <div
                              className="bg-gray-100 border border-gray-400 p-2 sm:p-3 text-xs space-y-2"
                              style={{
                                fontFamily: "MS Sans Serif, sans-serif",
                              }}
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <strong className="text-black">
                                    🕰️ Período:
                                  </strong>
                                  <p className="text-gray-700">
                                    {dino.period ?? "Desconocido"}
                                  </p>
                                </div>
                                <div>
                                  <strong className="text-black">
                                    💰 Costo:
                                  </strong>
                                  <p className="text-gray-700">
                                    {dino.adoptionCost} DinoPoints
                                  </p>
                                </div>
                              </div>

                              <div>
                                <strong className="text-black">
                                  📝 Descripción:
                                </strong>
                                <p className="text-gray-700 mt-1">
                                  {dino.description ??
                                    "Información no disponible"}
                                </p>
                              </div>

                              {dino.adoptedBy && (
                                <div>
                                  <strong className="text-black">
                                    👤 Adoptado por:
                                  </strong>
                                  <p className="text-gray-700">
                                    {dino.adoptedBy.username}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Botones de acción responsive */}
                            <div className="flex flex-col gap-2">
                              {!dino.adoptedBy && (
                                <button
                                  className="bg-gradient-to-r from-green-400 to-green-500 border-2 border-t-green-300 border-l-green-300 border-r-green-700 border-b-green-700 text-white px-3 sm:px-4 py-2 text-xs font-bold hover:from-green-300 hover:to-green-400 active:border-t-green-700 active:border-l-green-700 active:border-r-green-300 active:border-b-green-300 transition-all duration-200 shadow-md hover:shadow-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showAdoptDialog(dino);
                                  }}
                                  style={{
                                    fontFamily: "MS Sans Serif, sans-serif",
                                  }}
                                >
                                  <span className="flex items-center justify-center gap-1 sm:gap-2">
                                    🏠{" "}
                                    <span className="hidden sm:inline">
                                      ADOPTAR AHORA
                                    </span>
                                    <span className="sm:hidden">ADOPTAR</span>
                                  </span>
                                </button>
                              )}

                              {dino.adoptedBy &&
                                dino.adoptedBy._id === currentUserId && (
                                  <button
                                    className="bg-gradient-to-r from-red-400 to-red-500 border-2 border-t-red-300 border-l-red-300 border-r-red-700 border-b-red-700 text-white px-3 sm:px-4 py-2 text-xs font-bold hover:from-red-300 hover:to-red-400 active:border-t-red-700 active:border-l-red-700 active:border-r-red-300 active:border-b-red-300 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showReleaseDialog(dino);
                                    }}
                                    style={{
                                      fontFamily: "MS Sans Serif, sans-serif",
                                    }}
                                  >
                                    <span className="flex items-center justify-center gap-1 sm:gap-2">
                                      🔓{" "}
                                      <span className="hidden sm:inline">
                                        LIBERAR DINOSAURIO
                                      </span>
                                      <span className="sm:hidden">LIBERAR</span>
                                    </span>
                                  </button>
                                )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDino(null);
                                }}
                                className="bg-gradient-to-r from-gray-300 to-gray-400 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 text-black px-3 sm:px-4 py-1 text-xs font-bold hover:from-gray-200 hover:to-gray-300 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-200"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                ✕ Cerrar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Vista de lista responsive */
              <div className="p-1 sm:p-2 overflow-x-auto">
                <table
                  className="w-full text-xs min-w-full"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-200 to-gray-300 border-b-2 border-gray-400">
                      <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 min-w-24">
                        🦕 Nombre
                      </th>
                      <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 hidden sm:table-cell">
                        🦖 Tipo
                      </th>
                      <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400">
                        ✨ Rareza
                      </th>
                      <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 hidden lg:table-cell">
                        🕰️ Período
                      </th>
                      <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400">
                        💰 Costo
                      </th>
                      <th className="text-left p-2 sm:p-3 text-black font-bold border-r border-gray-400 hidden md:table-cell">
                        📊 Estado
                      </th>
                      <th className="text-left p-2 sm:p-3 text-black font-bold">
                        ⚡ Acciones
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
                            <span className="text-sm sm:text-lg">
                              {typeEmojis[dino.type] ?? "🦕"}
                            </span>
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
                        <td className="p-2 sm:p-3 border-r border-gray-200">
                          <span
                            className={`px-1 sm:px-2 py-1 text-xs border ${
                              rarityColors[dino.rarity] ??
                              "bg-gray-200 text-gray-700 border-gray-400"
                            }`}
                          >
                            {rarityEmojis[dino.rarity] ?? "⚫"}
                            <span className="hidden sm:inline">
                              {" "}
                              {dino.rarity}
                            </span>
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-black border-r border-gray-200 hidden lg:table-cell">
                          {dino.period}
                        </td>
                        <td className="p-2 sm:p-3 text-black border-r border-gray-200">
                          <span className="bg-yellow-200 px-1 sm:px-2 py-1 rounded border border-yellow-400 text-xs">
                            {dino.adoptionCost}
                            <span className="hidden sm:inline"> pts</span>
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 border-r border-gray-200 hidden md:table-cell">
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
                            {!dino.adoptedBy && (
                              <button
                                onClick={() => showAdoptDialog(dino)}
                                className="bg-gradient-to-r from-green-300 to-green-400 border-2 border-t-white border-l-white border-r-green-600 border-b-green-600 px-1 sm:px-2 py-1 text-black text-xs font-bold hover:from-green-200 hover:to-green-300 active:border-t-green-600 active:border-l-green-600 active:border-r-white active:border-b-white transition-all"
                                style={{
                                  fontFamily: "MS Sans Serif, sans-serif",
                                }}
                              >
                                🏠{" "}
                                <span className="hidden sm:inline">
                                  Adoptar
                                </span>
                              </button>
                            )}
                            {dino.adoptedBy &&
                              dino.adoptedBy._id === currentUserId && (
                                <button
                                  onClick={() => showReleaseDialog(dino)}
                                  className="bg-gradient-to-r from-red-300 to-red-400 border-2 border-t-white border-l-white border-r-red-600 border-b-red-600 px-1 sm:px-2 py-1 text-black text-xs font-bold hover:from-red-200 hover:to-red-300 active:border-t-red-600 active:border-l-red-600 active:border-r-white active:border-b-white transition-all"
                                  style={{
                                    fontFamily: "MS Sans Serif, sans-serif",
                                  }}
                                >
                                  🔓{" "}
                                  <span className="hidden sm:inline">
                                    Liberar
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
            )}
          </div>

          {/* Información del sistema responsive */}
          <div className="mt-4 bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-3 shadow-inner">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <div className="text-black">
                <strong>🖥️ Sistema:</strong>
                <span className="hidden sm:inline">
                  {" "}
                  Windows DinoAdopt 98 SE Professional
                </span>
                <span className="sm:hidden"> DinoAdopt 98</span>
              </div>
              <div className="text-black">
                <strong>💾 Memoria libre:</strong>{" "}
                {Math.floor(Math.random() * 100) + 50} MB
              </div>
              <div className="text-black">
                <strong>
                  🕒 <span className="hidden sm:inline">Último </span>
                  Actualizado:
                </strong>{" "}
                <span className="hidden sm:inline">
                  {new Date().toLocaleString()}
                </span>
                <span className="sm:hidden">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de estado responsive */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-300 border-t-2 border-t-white p-1 sm:p-2 flex justify-between items-center text-xs z-20 shadow-xl"
        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
      >
        <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto">
          <div className="bg-gray-200 border border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 sm:px-3 py-1 shadow-inner flex-shrink-0">
            <span className="text-black font-bold">🦕 DinoAdopt v3.0</span>
          </div>
          {user && (
            <div className="bg-yellow-200 border border-yellow-400 border-t-yellow-600 border-l-yellow-600 border-r-yellow-200 border-b-yellow-200 px-2 sm:px-3 py-1 shadow-inner flex-shrink-0">
              <span className="text-black font-bold">
                💎 <span className="hidden sm:inline">DinoPoints: </span>
                {user.points}
              </span>
            </div>
          )}
          <div className="bg-green-200 border border-green-400 border-t-green-600 border-l-green-600 border-r-green-200 border-b-green-200 px-2 sm:px-3 py-1 shadow-inner flex-shrink-0">
            <span className="text-black font-bold">
              📊 <span className="hidden sm:inline">Mostrando: </span>
              {dinos.length}/{dinos.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-black font-bold text-xs">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="fixed top-0 right-0 z-50 space-y-2 p-2 sm:p-4">
        {notifications.map((notification) => (
          <Windows98Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Dialog de confirmación */}
      {dialogState.show && dialogState.dino && (
        <Windows98Dialog
          title={
            dialogState.type === "adopt"
              ? "🏠 Confirmar Adopción"
              : "🔓 Confirmar Liberación"
          }
          message={
            dialogState.type === "adopt"
              ? `¿Estás seguro de que quieres adoptar a ${dialogState.dino.name} por ${dialogState.dino.adoptionCost} DinoPoints? Esta acción no se puede deshacer.`
              : `¿Estás seguro de que quieres liberar a ${dialogState.dino.name}? Una vez liberado, otros usuarios podrán adoptarlo y perderás la propiedad del dinosaurio.`
          }
          onConfirm={() => {
            if (dialogState.type === "adopt") {
              handleAdoptDino(dialogState.dino!);
            } else {
              handleReleaseDino(dialogState.dino!);
            }
          }}
          onCancel={() =>
            setDialogState({ show: false, type: "adopt", dino: null })
          }
          confirmText={
            dialogState.type === "adopt" ? "🏠 Adoptar" : "🔓 Liberar"
          }
          cancelText="❌ Cancelar"
        />
      )}
    </div>
  );
};

export default Adopciones;
