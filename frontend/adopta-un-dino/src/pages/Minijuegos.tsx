import React, { useState, useEffect } from "react";
import MiniGameFlappy from "../components/MiniGameFlappy";
import Leaderboard from "../components/Leaderboard";
import { useUser } from "../context/UserContext";

const Minijuegos = () => {
  const { user } = useUser();
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

      {/* Decoraciones flotantes - ocultas en móvil para mejor performance */}
      <div className="hidden md:block absolute top-10 left-10 text-4xl lg:text-6xl opacity-10 animate-bounce">
        🦕
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

      {/* Ventana principal responsive */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-7xl mx-auto shadow-2xl">
        {/* Barra de título responsive */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white px-2 sm:px-3 py-2 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs sm:text-sm font-bold text-black rounded-sm shadow-inner flex-shrink-0">
              🎮
            </div>
            <span
              className="text-xs sm:text-sm font-bold tracking-wide truncate"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden md:inline">
                DinoGames - Centro de Entretenimiento Prehistórico v2.0
              </span>
              <span className="md:hidden">DinoGames v2.0</span>
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

        {/* Barra de herramientas responsive */}
        <div className="bg-gray-200 border-b-2 border-gray-400 p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 shadow-inner">
          {/* Botones de navegación */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveSection("game")}
              className={`border-2 px-2 sm:px-4 py-1 sm:py-2 shadow-md hover:bg-gray-200 cursor-pointer transition-all whitespace-nowrap ${
                activeSection === "game"
                  ? "bg-gradient-to-b from-gray-100 to-gray-300 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                  : "bg-gray-300 border-t-gray-600 border-l-gray-600 border-r-white border-b-white"
              }`}
            >
              <span
                className="text-xs font-bold text-black flex items-center gap-1 sm:gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🎮 <span className="hidden sm:inline">Juegos</span>
              </span>
            </button>

            <button
              onClick={() => setActiveSection("leaderboard")}
              className={`border-2 px-2 sm:px-4 py-1 sm:py-2 shadow-md hover:bg-gray-200 cursor-pointer transition-all whitespace-nowrap ${
                activeSection === "leaderboard"
                  ? "bg-gradient-to-b from-gray-100 to-gray-300 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                  : "bg-gray-300 border-t-gray-600 border-l-gray-600 border-r-white border-b-white"
              }`}
            >
              <span
                className="text-xs font-bold text-black flex items-center gap-1 sm:gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🏆 <span className="hidden sm:inline">Puntuaciones</span>
              </span>
            </button>

            <div className="hidden md:block bg-gray-300 border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 sm:px-4 py-1 sm:py-2 shadow-inner hover:bg-gray-200 cursor-pointer transition-all">
              <span
                className="text-xs font-bold text-black flex items-center gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                ⚙️ Configuración
              </span>
            </div>
          </div>

          {/* Panel de DinoPoints */}
          <div className="ml-auto bg-gradient-to-b from-green-100 to-green-200 border-2 border-green-400 px-2 sm:px-4 py-1 sm:py-2 shadow-md flex-shrink-0">
            <span
              className="text-xs sm:text-sm text-green-800 font-bold flex items-center gap-1 sm:gap-2"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              💎 <span className="hidden sm:inline">DinoPoints:</span>{" "}
              {user?.points || 0}
            </span>
          </div>
        </div>

        {/* Panel de bienvenida responsive */}
        <div className="bg-gray-200 border-b-2 border-gray-400 p-2 sm:p-4 shadow-inner">
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h2
                  className="text-sm sm:text-lg font-bold text-black mb-1"
                  style={{
                    fontFamily: "MS Sans Serif, sans-serif",
                    textShadow: "1px 1px 0px #c0c0c0",
                  }}
                >
                  ¡Bienvenido, {user?.username || "Invitado"}! 👋
                </h2>
                <p
                  className="text-xs sm:text-sm text-gray-700"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  {activeSection === "game"
                    ? "Disfruta de nuestros juegos prehistóricos y gana DinoPoints"
                    : "Consulta las mejores puntuaciones y tus estadísticas personales"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
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

        {/* Contenido principal responsive */}
        <div className="bg-gray-300 p-2 sm:p-6">
          {activeSection === "game" ? (
            <>
              {/* Panel de título del juego responsive */}
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 sm:p-6 mb-3 sm:mb-6 shadow-inner">
                <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 shadow-md">
                  <div className="text-center">
                    <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 animate-bounce">
                      🦅
                    </div>
                    <h1
                      className="text-lg sm:text-3xl font-bold text-black mb-2 sm:mb-3"
                      style={{
                        fontFamily: "MS Sans Serif, sans-serif",
                        textShadow: "2px 2px 0px #c0c0c0",
                      }}
                    >
                      <span className="hidden sm:inline">
                        PTEROSAURIO FLAPPY
                      </span>
                      <span className="sm:hidden">PTERO FLAPPY</span>
                    </h1>
                    <div className="bg-blue-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold inline-block mb-2 sm:mb-3 shadow-md">
                      JUEGO DESTACADO
                    </div>
                    <p
                      className="text-xs sm:text-sm text-black max-w-2xl mx-auto"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      <span className="hidden sm:inline">
                        ¡Ayuda al pterosaurio a volar entre los obstáculos
                        prehistóricos! Cada 10 obstáculos superados te otorgan{" "}
                        <strong>5 DinoPoints</strong>. ¿Podrás superar tu récord
                        personal y llegar al Top 10?
                      </span>
                      <span className="sm:hidden">
                        ¡Vola entre obstáculos y gana{" "}
                        <strong>5 DinoPoints</strong> cada 10!
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Área del juego responsive */}
              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-2 sm:p-6 mb-3 sm:mb-6 shadow-lg">
                <div className="flex justify-center">
                  <MiniGameFlappy
                    onWin={handleWin}
                    onScoreUpdate={handleScoreUpdate}
                  />
                </div>
              </div>

              {/* Panel de información adicional responsive */}
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-4 shadow-inner">
                <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 shadow-md">
                  <h3
                    className="text-sm sm:text-lg font-bold text-black mb-2 sm:mb-3 text-center"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    📖 CÓMO JUGAR
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div
                      className="bg-blue-100 border border-blue-400 p-2 sm:p-3"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      <h4 className="font-bold text-blue-800 mb-2">
                        🎮 Controles
                      </h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>
                          • <strong>Clic</strong> o <strong>Toque:</strong>{" "}
                          Volar
                        </li>
                        <li>
                          • <strong>Espacio:</strong> Volar (PC)
                        </li>
                        <li>
                          • <strong>Enter:</strong> Reiniciar
                        </li>
                      </ul>
                    </div>
                    <div
                      className="bg-green-100 border border-green-400 p-2 sm:p-3"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      <h4 className="font-bold text-green-800 mb-2">
                        🏆 Objetivos
                      </h4>
                      <ul className="text-green-700 space-y-1">
                        <li>• Pasa entre obstáculos</li>
                        <li>
                          • <strong>5 DinoPoints</strong> cada 10
                        </li>
                        <li>• ⚡ Velocidad aumenta</li>
                        <li>• ¡Bate tu récord!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Panel de título del leaderboard responsive */}
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 sm:p-6 mb-3 sm:mb-6 shadow-inner">
                <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 shadow-md">
                  <div className="text-center">
                    <div className="text-3xl sm:text-5xl mb-2 sm:mb-3">🏆</div>
                    <h1
                      className="text-lg sm:text-3xl font-bold text-black mb-2 sm:mb-3"
                      style={{
                        fontFamily: "MS Sans Serif, sans-serif",
                        textShadow: "2px 2px 0px #c0c0c0",
                      }}
                    >
                      <span className="hidden sm:inline">
                        TABLA DE PUNTUACIONES
                      </span>
                      <span className="sm:hidden">RANKINGS</span>
                    </h1>
                    <div className="bg-orange-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold inline-block mb-2 sm:mb-3 shadow-md">
                      RANKING MUNDIAL
                    </div>
                    <p
                      className="text-xs sm:text-sm text-black max-w-2xl mx-auto"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      <span className="hidden sm:inline">
                        Consulta las mejores puntuaciones de todos los jugadores
                        y compara tu rendimiento. ¡Compite por llegar al primer
                        puesto!
                      </span>
                      <span className="sm:hidden">
                        Mejores puntuaciones y tus estadísticas
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Área del leaderboard responsive */}
              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-2 sm:p-6 shadow-lg">
                <Leaderboard key={leaderboardKey} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Barra de estado responsive */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-300 to-gray-200 border-t-2 border-t-white p-1 sm:p-2 flex justify-between items-center text-xs z-20 shadow-lg overflow-x-auto"
        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
      >
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-black font-bold">DinoGames v2.0</span>
            <span className="text-gray-600 hidden sm:inline">
              Sistema Operativo
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-black">🎮</span>
            <span className="text-black hidden sm:inline">
              Juegos: 1 activo
            </span>
            <span className="text-black sm:hidden">1 juego</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-black">💾</span>
            <span className="text-black">Guardado automático</span>
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

export default Minijuegos;
