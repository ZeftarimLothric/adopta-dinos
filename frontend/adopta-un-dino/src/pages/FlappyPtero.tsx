// src/pages/FlappyPtero.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import MiniGameFlappyPhaser, {
  FLAPPY_CONFIG,
} from "../components/MiniGameFlappyPhaser";
import Leaderboard from "../components/Leaderboard";

const FlappyPtero = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState<"game" | "leaderboard">(
    "game"
  );
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWin = async (points: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/add-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points }),
      });
      if (!res.ok) {
        throw new Error("Error al enviar puntos al backend");
      }
    } catch (err) {
      console.error("Error al enviar puntos al backend", err);
    }
  };

  const handleScoreUpdate = () => {
    setLeaderboardKey((prev) => prev + 1);
  };

  //   const isMobile = window.innerWidth < 640;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 p-2 sm:p-4 pb-16 relative overflow-hidden">
      {/* Patrón de fondo responsive */}
      <div className="absolute inset-0 opacity-15">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                #ffffff 10px,
                #ffffff 12px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                #ffffff 10px,
                #ffffff 12px
              )
            `,
          }}
        ></div>
      </div>

      {/* Decoraciones flotantes */}
      <div className="hidden md:block absolute top-10 left-10 text-4xl lg:text-6xl opacity-10 animate-bounce">
        🦅
      </div>
      <div className="hidden md:block absolute top-20 right-20 text-3xl lg:text-5xl opacity-10 animate-pulse">
        🎮
      </div>
      <div
        className="hidden md:block absolute bottom-20 left-20 text-2xl lg:text-4xl opacity-10 animate-bounce"
        style={{ animationDelay: "1s" }}
      >
        🏆
      </div>
      <div
        className="hidden md:block absolute bottom-10 right-10 text-3xl lg:text-5xl opacity-10 animate-pulse"
        style={{ animationDelay: "2s" }}
      >
        💎
      </div>

      {/* Ventana principal */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-7xl mx-auto shadow-2xl">
        {/* Barra de título - CON BOTÓN INTEGRADO */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white px-2 sm:px-3 py-2 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botón de regreso integrado */}
            <button
              onClick={() => navigate("/minijuegos")}
              className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs sm:text-sm font-bold text-black rounded-sm shadow-inner flex-shrink-0 hover:bg-gray-200 transition-colors"
              title="Volver al Hub de Minijuegos"
            >
              ←
            </button>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs sm:text-sm font-bold text-black rounded-sm shadow-inner flex-shrink-0">
              🦅
            </div>
            <span
              className="text-xs sm:text-sm font-bold tracking-wide truncate"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden md:inline">
                Pterosaurio Flappy - Aventura Prehistórica v1.0
              </span>
              <span className="md:hidden">Ptero Flappy v1.0</span>
            </span>
            <div className="hidden sm:block bg-blue-900 px-2 py-1 rounded text-xs border border-blue-700 flex-shrink-0">
              ACTIVO
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer transition-colors">
              _
            </div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer transition-colors">
              □
            </div>
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 border border-red-700 flex items-center justify-center text-xs text-white hover:bg-red-400 cursor-pointer transition-colors"
              onClick={() => navigate("/minijuegos")}
            >
              ×
            </div>
          </div>
        </div>

        {/* Panel de información del juego */}
        <div className="bg-gray-200 border-b-2 border-gray-400 p-2 sm:p-4 shadow-inner">
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h2
                  className="text-sm sm:text-lg font-bold text-black mb-1 flex items-center gap-2"
                  style={{
                    fontFamily: "MS Sans Serif, sans-serif",
                    textShadow: "1px 1px 0px #c0c0c0",
                  }}
                >
                  🦅 PTEROSAURIO FLAPPY
                  <div className="bg-green-100 border border-green-400 px-2 py-1 text-xs">
                    <span className="text-green-600 font-bold">
                      +{FLAPPY_CONFIG.DINOPOINTS_AMOUNT} pts cada{" "}
                      {FLAPPY_CONFIG.DINOPOINTS_INTERVAL} obstáculos
                    </span>
                  </div>
                </h2>
                <p
                  className="text-xs sm:text-sm text-gray-700"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ¡Ayuda al pterosaurio a volar entre los obstáculos
                  prehistóricos! Gana DinoPoints y compite por el mejor puntaje.
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="bg-gradient-to-b from-green-100 to-green-200 border-2 border-green-400 px-2 sm:px-4 py-1 sm:py-2 shadow-md">
                    <span
                      className="text-xs sm:text-sm text-green-800 font-bold flex items-center gap-1 sm:gap-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      💎 <span className="hidden sm:inline">DinoPoints:</span>{" "}
                      {user?.points || 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs sm:text-sm font-bold text-blue-600"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🕐 {currentTime.toLocaleTimeString()}
                    </div>
                    <div
                      className="text-xs text-gray-600"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      <span className="hidden sm:inline">
                        {currentTime.toLocaleDateString()}
                      </span>
                      <span className="sm:hidden">
                        {currentTime.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación de secciones */}
        <div className="bg-gray-200 border-b-2 border-gray-400 p-2 sm:p-3 shadow-inner">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("game")}
              className={`border-2 px-3 sm:px-4 py-1 sm:py-2 shadow-md hover:bg-gray-200 cursor-pointer transition-all ${
                activeSection === "game"
                  ? "bg-gradient-to-b from-gray-100 to-gray-300 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                  : "bg-gray-300 border-t-gray-600 border-l-gray-600 border-r-white border-b-white"
              }`}
            >
              <span
                className="text-xs sm:text-sm font-bold text-black flex items-center gap-1 sm:gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🎮 <span className="hidden sm:inline">JUGAR</span>
              </span>
            </button>
            <button
              onClick={() => setActiveSection("leaderboard")}
              className={`border-2 px-3 sm:px-4 py-1 sm:py-2 shadow-md hover:bg-gray-200 cursor-pointer transition-all ${
                activeSection === "leaderboard"
                  ? "bg-gradient-to-b from-gray-100 to-gray-300 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                  : "bg-gray-300 border-t-gray-600 border-l-gray-600 border-r-white border-b-white"
              }`}
            >
              <span
                className="text-xs sm:text-sm font-bold text-black flex items-center gap-1 sm:gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🏆 <span className="hidden sm:inline">RANKING</span>
              </span>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-gray-300 p-2 sm:p-6">
          {activeSection === "game" && (
            <MiniGameFlappyPhaser
              onWin={handleWin}
              onScoreUpdate={handleScoreUpdate}
              //   isMobile={isMobile}
            />
          )}

          {activeSection === "leaderboard" && (
            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4 shadow-md">
              <h3
                className="text-lg font-bold text-black mb-4 flex items-center gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🏆 RANKING PTEROSAURIO FLAPPY
              </h3>
              <Leaderboard key={leaderboardKey} />
            </div>
          )}
        </div>
      </div>

      {/* Barra de estado */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-300 to-gray-200 border-t-2 border-t-white p-1 sm:p-2 flex justify-between items-center text-xs z-20 shadow-lg overflow-x-auto"
        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
      >
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-black font-bold">
              Pterosaurio Flappy v1.0
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-black">🎮</span>
            <span className="text-black">Estado: En línea</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="text-black">
            🧑‍💻 <strong>{user?.username || "Invitado"}</strong>
          </div>
          <div className="text-black">
            <span className="hidden sm:inline">
              📅 {currentTime.toLocaleDateString()} | 🕐{" "}
              {currentTime.toLocaleTimeString()}
            </span>
            <span className="sm:hidden">
              🕐{" "}
              {currentTime.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlappyPtero;
