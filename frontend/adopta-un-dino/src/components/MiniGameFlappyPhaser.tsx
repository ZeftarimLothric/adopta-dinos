import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";
import FlappyScene from "../games/FlappyScene";
import { useUser } from "../context/UserContext";

export const FLAPPY_CONFIG = {
  DINOPOINTS_INTERVAL: 10,
  DINOPOINTS_AMOUNT: 20, // Aquí está el valor correcto
};

interface MiniGameFlappyPhaserProps {
  onWin: (points: number) => void;
  onScoreUpdate?: () => void;
}

const MiniGameFlappyPhaser: React.FC<MiniGameFlappyPhaserProps> = ({
  onWin,
  onScoreUpdate,
}) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(3);
  const [notification, setNotification] = useState<string | null>(null);
  const [packagesGiven, setPackagesGiven] = useState(0);

  const { user, updateUser } = useUser();
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  // Configuración del juego Phaser
  useEffect(() => {
    if (!gameRef.current) return;

    // Detectar tamaño de pantalla y calcular dimensiones del juego
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isPortrait = screenHeight > screenWidth;

    const isMobile =
      screenWidth < 640 ||
      (isPortrait && screenWidth < 800) ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Calcular tamaño adaptativo
    const maxGameSize = Math.min(screenWidth * 0.95, screenHeight * 0.7);
    const gameSize = isMobile
      ? Math.min(maxGameSize, 380)
      : Math.min(maxGameSize, 480);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: gameSize,
      height: gameSize,
      parent: gameRef.current,
      scene: FlappyScene,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      backgroundColor: "#87CEEB",
    };

    gameInstanceRef.current = new Phaser.Game(config);

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  // Escuchar eventos del juego Phaser
  useEffect(() => {
    const handleGameStarted = () => {
      setGameStarted(true);
      setGameOver(false);
    };

    const handleScoreUpdate = (e: any) => {
      setScore(e.detail.score);
    };

    const handleSpeedUpdate = (e: any) => {
      setCurrentSpeed(e.detail.speed);
      if (e.detail.speed > 3) {
        setNotification(`¡Velocidad aumentada! Nivel ${getSpeedLevel()}`);
        setTimeout(() => setNotification(null), 1500);
      }
    };

    const handlePointsEarned = (e: any) => {
      const pointsToAdd = e.detail.points;
      onWin(pointsToAdd);

      if (user) {
        const newUser = { ...user, points: user.points + pointsToAdd };
        updateUser(newUser);
      }

      setNotification(`+${pointsToAdd} DinoPoints!`);
      setTimeout(() => setNotification(null), 2000);

      setPackagesGiven(Math.floor(e.detail.score / 10));
    };

    const handleGameOver = (e: any) => {
      setGameOver(true);
      setGameStarted(false);
      submitScore(e.detail.score);
    };

    const handleGameReset = () => {
      setScore(0);
      setGameOver(false);
      setGameStarted(false);
      setCurrentSpeed(3);
      setPackagesGiven(0);
      setNotification(null);
    };

    // Agregar listeners
    window.addEventListener("flappyGameStarted", handleGameStarted);
    window.addEventListener("flappyScoreUpdate", handleScoreUpdate);
    window.addEventListener("flappySpeedUpdate", handleSpeedUpdate);
    window.addEventListener("flappyPointsEarned", handlePointsEarned);
    window.addEventListener("flappyGameOver", handleGameOver);
    window.addEventListener("flappyGameReset", handleGameReset);

    return () => {
      window.removeEventListener("flappyGameStarted", handleGameStarted);
      window.removeEventListener("flappyScoreUpdate", handleScoreUpdate);
      window.removeEventListener("flappySpeedUpdate", handleSpeedUpdate);
      window.removeEventListener("flappyPointsEarned", handlePointsEarned);
      window.removeEventListener("flappyGameOver", handleGameOver);
      window.removeEventListener("flappyGameReset", handleGameReset);
    };
  }, [user, updateUser, onWin]);

  // Función para enviar score al backend (MISMA que antes)
  const submitScore = async (finalScore: number) => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/game-score`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            game: "flappyPtero",
            score: finalScore,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.isNewRecord) {
          setNotification("🏆 ¡NUEVO RÉCORD PERSONAL!");
          setTimeout(() => setNotification(null), 3000);
        }
        if (onScoreUpdate) onScoreUpdate();
      }
    } catch (error) {
      console.error("Error enviando score:", error);
    }
  };

  // Funciones auxiliares (MISMAS que antes)
  const getSpeedLevel = () => Math.floor(score / 10) + 1;

  const getSpeedColor = () => {
    const level = getSpeedLevel();
    if (level <= 2) return "text-green-600";
    if (level <= 4) return "text-yellow-600";
    if (level <= 6) return "text-orange-600";
    return "text-red-600";
  };

  const getSpeedDisplay = () => currentSpeed.toFixed(1);

  const isMobile = window.innerWidth < 640;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Marco del juego estilo Windows 98 - EXACTAMENTE IGUAL */}
      <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-2 sm:p-3">
        {/* Barra de título del juego - IGUAL */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 sm:px-3 py-1 mb-2 sm:mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
              🎮
            </div>
            <span
              className="text-xs sm:text-sm font-bold truncate"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden sm:inline">FlappyPtero.exe - </span>
              {gameStarted ? "EN JUEGO" : "LISTO"}
            </span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              _
            </div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              ×
            </div>
          </div>
        </div>

        {/* Panel de estadísticas - IGUAL */}
        <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-3 mb-2 sm:mb-3">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div
                className="text-sm sm:text-lg font-bold text-black"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {score}
              </div>
              <div
                className="text-xs text-black"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="hidden sm:inline">Obstáculos</span>
                <span className="sm:hidden">Score</span>
              </div>
            </div>
            <div>
              <div
                className="text-sm sm:text-lg font-bold text-green-600"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {user?.points || 0}
              </div>
              <div
                className="text-xs text-black"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="hidden sm:inline">DinoPoints</span>
                <span className="sm:hidden">Puntos</span>
              </div>
            </div>
            <div>
              <div
                className="text-sm sm:text-lg font-bold text-purple-600"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {Math.floor(score / FLAPPY_CONFIG.DINOPOINTS_INTERVAL) *
                  FLAPPY_CONFIG.DINOPOINTS_AMOUNT}
              </div>
              <div
                className="text-xs text-black"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Ganados
              </div>
            </div>
          </div>
        </div>

        {/* Área de juego Phaser - AQUÍ ESTÁ EL CAMBIO */}
        <div className="flex justify-center items-center min-h-[400px] p-4">
          <div className="relative">
            {/* Contenedor del juego Phaser */}
            <div
              ref={gameRef}
              className="border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 overflow-hidden mx-auto"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "95vw",
                maxHeight: "70vh",
                userSelect: "none",
                touchAction: "none",
                display: "block",
              }}
            />

            {/* Indicador de velocidad superpuesto */}
            {gameStarted && !gameOver && (
              <div
                className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-1 sm:px-2 py-1 z-10"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs text-black">
                    <span className="hidden sm:inline">Vel:</span>
                    <span className="sm:hidden">V:</span>
                  </span>
                  <span className={`text-xs font-bold ${getSpeedColor()}`}>
                    {getSpeedDisplay()}
                  </span>
                  <div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
                      currentSpeed > 3 ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></div>
                </div>
              </div>
            )}

            {/* Game Over Modal superpuesto */}
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 p-2 z-20">
                <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-3 sm:p-4 w-full max-w-xs sm:max-w-sm">
                  {/* Barra de título del modal */}
                  <div className="bg-gradient-to-r from-red-800 to-red-600 text-white px-2 py-1 mb-2 sm:mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                      <div className="w-3 h-3 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                        ⚠
                      </div>
                      <span
                        className="text-xs font-bold truncate"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        <span className="hidden sm:inline">
                          Game Over - FlappyPtero.exe
                        </span>
                        <span className="sm:hidden">Game Over</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 mb-2 sm:mb-3">
                    <div className="text-center">
                      <div
                        className="text-sm sm:text-lg font-bold text-black mb-2"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        🏆{" "}
                        <span className="hidden sm:inline">
                          RESULTADO FINAL
                        </span>
                        <span className="sm:hidden">RESULTADO</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <div
                            className="font-bold text-black"
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            <span className="hidden sm:inline">
                              Obstáculos:{" "}
                            </span>
                            <span className="sm:hidden">Score: </span>
                            {score}
                          </div>
                          <div
                            className={`font-bold ${getSpeedColor()}`}
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            <span className="hidden sm:inline">
                              Velocidad máx:{" "}
                            </span>
                            <span className="sm:hidden">Vel máx: </span>
                            {getSpeedDisplay()}
                          </div>
                        </div>
                        <div>
                          <div
                            className="font-bold text-green-600"
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            Ganados:{" "}
                            {Math.floor(
                              score / FLAPPY_CONFIG.DINOPOINTS_INTERVAL
                            ) * FLAPPY_CONFIG.DINOPOINTS_AMOUNT}{" "}
                            pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // El botón triggerea el reset en Phaser
                      if (gameInstanceRef.current) {
                        const scene = gameInstanceRef.current.scene.getScene(
                          "FlappyScene"
                        ) as FlappyScene;
                        if (scene) {
                          scene.resetGame();
                        }
                      }
                    }}
                    className="w-full bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 sm:px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100 text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    ► Jugar de nuevo
                  </button>
                </div>
              </div>
            )}

            {/* Notificación de puntos */}
            {notification && (
              <Windows98Notification
                message={notification}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>

        {/* Panel de controles - IGUAL */}
        <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-3 mt-2 sm:mt-3">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-xs"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            <div>
              <strong>Controles:</strong>
              <br />
              <span className="hidden sm:inline">
                • Clic: Volar hacia arriba
                <br />
                • Espacio: Volar hacia arriba
                <br />• Enter: Iniciar/Reiniciar
              </span>
              <span className="sm:hidden">
                • Toca pantalla: Volar
                <br />• Toca cuando pierdas: Reiniciar
              </span>
            </div>
            <div>
              <strong>Objetivo:</strong>
              <br />
              <span className="hidden sm:inline">
                • Pasa entre los obstáculos
                <br />• Gana {FLAPPY_CONFIG.DINOPOINTS_AMOUNT} DinoPoints cada{" "}
                {FLAPPY_CONFIG.DINOPOINTS_INTERVAL} obstáculos
                <br />
                • ⚡ Velocidad aumenta cada 10 obstáculos
                <br />• ¡Consigue la puntuación más alta!
              </span>
              <span className="sm:hidden">
                • Esquiva obstáculos
                <br />• {FLAPPY_CONFIG.DINOPOINTS_AMOUNT} puntos cada{" "}
                {FLAPPY_CONFIG.DINOPOINTS_INTERVAL} obstáculos
                <br />
                • ⚡ Velocidad aumenta
                <br />• ¡Consigue el récord!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de notificación (IGUAL que antes)
const Windows98Notification: React.FC<{
  message: string;
  isMobile?: boolean;
}> = ({ message, isMobile = false }) => (
  <div
    className={`absolute ${
      isMobile ? "top-2" : "top-4"
    } left-1/2 transform -translate-x-1/2 z-30 animate-bounce`}
  >
    <div
      className={`bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 ${
        isMobile ? "p-1" : "p-2"
      }`}
    >
      <div
        className={`bg-gradient-to-r from-green-800 to-green-600 text-white ${
          isMobile ? "px-1 py-0.5 mb-1" : "px-2 py-1 mb-1"
        } flex items-center`}
      >
        <div
          className={`${
            isMobile ? "w-2 h-2 mr-1" : "w-3 h-3 mr-2"
          } bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black flex-shrink-0`}
        >
          💰
        </div>
        <span
          className={`${isMobile ? "text-xs" : "text-xs"} font-bold truncate`}
          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
        >
          <span className="hidden sm:inline">DinoPoints</span>
          <span className="sm:hidden">Pts</span>
        </span>
      </div>
      <div
        className={`bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 ${
          isMobile ? "p-1" : "p-2"
        } text-center`}
      >
        <span
          className={`text-green-600 font-bold ${
            isMobile ? "text-xs" : "text-sm"
          }`}
          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
        >
          {message}
        </span>
      </div>
    </div>
  </div>
);

export default MiniGameFlappyPhaser;
