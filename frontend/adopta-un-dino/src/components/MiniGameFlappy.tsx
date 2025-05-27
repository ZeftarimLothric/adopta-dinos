import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";

interface MiniGameFlappyProps {
  onWin: (points: number) => void;
  onScoreUpdate?: () => void;
}

// Configuración responsive del juego
const getGameDimensions = () => {
  const isMobile = window.innerWidth < 640;
  const isTablet = window.innerWidth < 1024 && window.innerWidth >= 640;

  if (isMobile) {
    return {
      GAME_WIDTH: Math.min(350, window.innerWidth - 40),
      GAME_HEIGHT: 300,
      PTERO_SIZE: 30,
      OBSTACLE_WIDTH: 50,
      OBSTACLE_GAP: 150,
    };
  } else if (isTablet) {
    return {
      GAME_WIDTH: 450,
      GAME_HEIGHT: 350,
      PTERO_SIZE: 32,
      OBSTACLE_WIDTH: 55,
      OBSTACLE_GAP: 165,
    };
  } else {
    return {
      GAME_WIDTH: 500,
      GAME_HEIGHT: 400,
      PTERO_SIZE: 35,
      OBSTACLE_WIDTH: 60,
      OBSTACLE_GAP: 180,
    };
  }
};

const GRAVITY = 0.5;
const JUMP_STRENGTH = -5;
const BASE_OBSTACLE_SPEED = 3;
const SPEED_INCREASE_RATE = 0.5;
const MAX_SPEED = 10;

const MiniGameFlappy: React.FC<MiniGameFlappyProps> = ({
  onWin,
  onScoreUpdate,
}) => {
  const [gameDimensions, setGameDimensions] = useState(getGameDimensions());
  const [pteroY, setPteroY] = useState(gameDimensions.GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<
    { x: number; height: number; scored: boolean }[]
  >([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [packagesGiven, setPackagesGiven] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(BASE_OBSTACLE_SPEED);
  const { user, updateUser } = useUser();
  const [notification, setNotification] = useState<string | null>(null);

  const gameLoopRef = useRef<number | null>(null);

  // Manejar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const newDimensions = getGameDimensions();
      setGameDimensions(newDimensions);
      if (!gameStarted) {
        setPteroY(newDimensions.GAME_HEIGHT / 2);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gameStarted]);

  // Calcular velocidad actual basada en el score
  const calculateSpeed = (score: number) => {
    const speedIncrease = Math.floor(score / 10) * SPEED_INCREASE_RATE;
    return Math.min(BASE_OBSTACLE_SPEED + speedIncrease, MAX_SPEED);
  };

  // Función para enviar score al backend
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

  // Actualizar velocidad cuando cambia el score
  useEffect(() => {
    const newSpeed = calculateSpeed(score);
    if (newSpeed !== currentSpeed) {
      setCurrentSpeed(newSpeed);
      if (score > 0 && score % 10 === 0) {
        setTimeout(() => {
          setNotification(`¡Velocidad aumentada! Nivel ${getSpeedLevel()}`);
          setTimeout(() => setNotification(null), 1500);
        }, 500);
      }
    }
  }, [score, currentSpeed]);

  // Salto al hacer click
  const handleJump = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
    }
    setVelocity(JUMP_STRENGTH);
  };

  // Inicializar obstáculos
  useEffect(() => {
    setObstacles([
      { x: gameDimensions.GAME_WIDTH + 100, height: 120, scored: false },
      { x: gameDimensions.GAME_WIDTH + 350, height: 180, scored: false },
    ]);
  }, [gameDimensions]);

  // Loop principal del juego
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    gameLoopRef.current = window.setInterval(() => {
      setVelocity((v) => v + GRAVITY);
      setPteroY((y) => {
        const newY = y + velocity;
        if (
          newY <= 0 ||
          newY >= gameDimensions.GAME_HEIGHT - gameDimensions.PTERO_SIZE
        ) {
          setGameOver(true);
          return y;
        }
        return newY;
      });

      const MIN_GAP_BETWEEN_OBSTACLES = gameDimensions.GAME_WIDTH * 0.56; // Responsive gap

      setObstacles((obs) => {
        let newObs = obs
          .map((o) => ({ ...o, x: o.x - currentSpeed }))
          .filter((o) => o.x + gameDimensions.OBSTACLE_WIDTH > -50);

        newObs.forEach((o) => {
          if (!o.scored && o.x + gameDimensions.OBSTACLE_WIDTH < 100) {
            o.scored = true;
            setScore((s) => s + 1);
          }
        });

        if (
          newObs.length === 0 ||
          newObs[newObs.length - 1].x <
            gameDimensions.GAME_WIDTH - MIN_GAP_BETWEEN_OBSTACLES
        ) {
          newObs = [
            ...newObs,
            {
              x: gameDimensions.GAME_WIDTH + 50,
              height: 80 + Math.random() * (gameDimensions.GAME_HEIGHT * 0.3),
              scored: false,
            },
          ];
        }

        return newObs;
      });
    }, 20);

    return () => {
      if (gameLoopRef.current) window.clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, velocity, currentSpeed, gameDimensions]);

  // Verificar colisiones
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    obstacles.forEach((o) => {
      if (
        o.x < 100 + gameDimensions.PTERO_SIZE &&
        o.x + gameDimensions.OBSTACLE_WIDTH > 100 &&
        (pteroY < o.height ||
          pteroY + gameDimensions.PTERO_SIZE >
            o.height + gameDimensions.OBSTACLE_GAP)
      ) {
        setGameOver(true);
        submitScore(score);
      }
    });
  }, [pteroY, obstacles, gameStarted, gameOver, score, gameDimensions]);

  // Dar puntos extra
  useEffect(() => {
    const currentPackage = Math.floor(score / 10);
    if (currentPackage > packagesGiven && score > 0) {
      const pointsToAdd = 5;
      onWin(pointsToAdd);

      if (user) {
        const newUser = { ...user, points: user.points + pointsToAdd };
        updateUser(newUser);
      }
      setNotification(`+${pointsToAdd} DinoPoints!`);
      setTimeout(() => setNotification(null), 2000);

      setPackagesGiven(currentPackage);
    }
  }, [score, packagesGiven, onWin, user, updateUser]);

  // Reiniciar
  const resetGame = () => {
    setPteroY(gameDimensions.GAME_HEIGHT / 2);
    setVelocity(0);
    setObstacles([
      { x: gameDimensions.GAME_WIDTH + 100, height: 120, scored: false },
      { x: gameDimensions.GAME_WIDTH + 350, height: 180, scored: false },
    ]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setPackagesGiven(0);
    setCurrentSpeed(BASE_OBSTACLE_SPEED);
    setNotification(null);
  };

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
      {/* Marco del juego estilo Windows 98 - responsive */}
      <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-2 sm:p-3">
        {/* Barra de título del juego - responsive */}
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

        {/* Panel de estadísticas - responsive */}
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
                {Math.floor(score / 10) * 5}
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

        {/* Área de juego - completamente responsive */}
        <div className="flex justify-center">
          <div
            className="border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 relative overflow-hidden cursor-pointer"
            style={{
              width: gameDimensions.GAME_WIDTH,
              height: gameDimensions.GAME_HEIGHT,
              background:
                "linear-gradient(to bottom, #87CEEB 0%, #87CEEB 75%, #90EE90 75%, #228B22 100%)",
              userSelect: "none",
              touchAction: "manipulation", // Mejor soporte táctil
            }}
            tabIndex={0}
            onClick={handleJump}
            onTouchStart={(e) => {
              e.preventDefault();
              handleJump();
            }}
            onKeyDown={(e) => {
              if (e.code === "Space" || e.code === "Enter") {
                e.preventDefault();
                handleJump();
              }
            }}
          >
            {/* Indicador de velocidad - responsive */}
            {gameStarted && !gameOver && (
              <div
                className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-1 sm:px-2 py-1"
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
                      currentSpeed > BASE_OBSTACLE_SPEED
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                </div>
              </div>
            )}

            {/* Pterosaurio - tamaño responsive */}
            <div
              className="absolute flex items-center justify-center transition-transform duration-75"
              style={{
                width: gameDimensions.PTERO_SIZE,
                height: gameDimensions.PTERO_SIZE,
                backgroundColor: "#FFA500",
                border: `${isMobile ? "2px" : "3px"} solid #FF8C00`,
                borderRadius: "50%",
                left: isMobile ? 70 : 100,
                top: pteroY,
                boxShadow:
                  "inset 2px 2px 0px #FFD700, inset -2px -2px 0px #CC6600",
                transform: `rotate(${Math.min(
                  Math.max(velocity * 3, -30),
                  30
                )}deg)`,
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? "16px" : "20px",
                  transform: "rotate(-10deg)",
                }}
              >
                🦅
              </span>
            </div>

            {/* Obstáculos - dimensiones responsive */}
            {obstacles.map((o, i) => (
              <React.Fragment key={i}>
                {/* Parte superior */}
                <div
                  className="absolute border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                  style={{
                    width: gameDimensions.OBSTACLE_WIDTH,
                    height: o.height,
                    background:
                      "linear-gradient(135deg, #228B22 0%, #006400 50%, #004d00 100%)",
                    left: o.x,
                    top: 0,
                    boxShadow: "inset 1px 1px 0px #32CD32",
                  }}
                />
                {/* Parte inferior */}
                <div
                  className="absolute border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                  style={{
                    width: gameDimensions.OBSTACLE_WIDTH,
                    height:
                      gameDimensions.GAME_HEIGHT -
                      (o.height + gameDimensions.OBSTACLE_GAP),
                    background:
                      "linear-gradient(135deg, #228B22 0%, #006400 50%, #004d00 100%)",
                    left: o.x,
                    top: o.height + gameDimensions.OBSTACLE_GAP,
                    boxShadow: "inset 1px 1px 0px #32CD32",
                  }}
                />
              </React.Fragment>
            ))}

            {/* Elementos decorativos - responsive */}
            <div
              className="absolute text-white opacity-70"
              style={{
                top: isMobile ? 20 : 30,
                left: (250 - currentSpeed * 20) % gameDimensions.GAME_WIDTH,
                fontSize: isMobile ? "12px" : "16px",
                transition: "left 0.1s ease-out",
              }}
            >
              ☁️
            </div>
            <div
              className="absolute text-white opacity-70"
              style={{
                top: isMobile ? 40 : 60,
                left: (380 - currentSpeed * 25) % gameDimensions.GAME_WIDTH,
                fontSize: isMobile ? "10px" : "14px",
                transition: "left 0.1s ease-out",
              }}
            >
              ☁️
            </div>
            <div
              className="absolute text-yellow-300 opacity-80"
              style={{
                top: isMobile ? 15 : 20,
                right: isMobile ? 30 : 50,
                fontSize: isMobile ? "16px" : "20px",
              }}
            >
              ☀️
            </div>

            {/* Pantalla de inicio - responsive */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-3 sm:p-4 text-center mx-2">
                  <h3
                    className="text-black font-bold mb-2 text-sm sm:text-base"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    🦅 PTEROSAURIO FLAPPY
                  </h3>
                  <p
                    className="text-xs text-black mb-3"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <span className="hidden sm:inline">Clic para comenzar</span>
                    <span className="sm:hidden">Toca para comenzar</span>
                  </p>
                  <div
                    className="text-xs text-gray-600"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    5 DinoPoints cada 10 obstáculos
                    <br />⚡{" "}
                    <span className="hidden sm:inline">
                      La velocidad aumenta cada 10 obstáculos
                    </span>
                    <span className="sm:hidden">Velocidad aumenta c/10</span>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Modal - responsive */}
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 p-2">
                <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-3 sm:p-4 w-full max-w-xs sm:max-w-sm">
                  {/* Barra de título del modal - responsive */}
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
                            Ganados: {Math.floor(score / 10) * 5} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={resetGame}
                    className="w-full bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 sm:px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100 text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    ► Jugar de nuevo
                  </button>
                </div>
              </div>
            )}

            {/* Notificación de puntos - responsive */}
            {notification && (
              <Windows98Notification
                message={notification}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>

        {/* Panel de controles - responsive */}
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
                <br />
                • Gana 5 DinoPoints cada 10 obstáculos
                <br />
                • ⚡ Velocidad aumenta cada 10 obstáculos
                <br />• ¡Consigue la puntuación más alta!
              </span>
              <span className="sm:hidden">
                • Esquiva obstáculos
                <br />
                • 5 puntos cada 10 obstáculos
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

export default MiniGameFlappy;
