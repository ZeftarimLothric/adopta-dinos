import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";

interface MiniGameFlappyProps {
  onWin: (points: number) => void;
}

const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const OBSTACLE_GAP = 180;
const OBSTACLE_WIDTH = 60;
const GAME_WIDTH = 500;
const GAME_HEIGHT = 400;
const PTERO_SIZE = 35;
const BASE_OBSTACLE_SPEED = 3; // Velocidad base
const SPEED_INCREASE_RATE = 0.5; // Incremento más notorio: +0.5 cada 10 obstáculos
const MAX_SPEED = 10; // Velocidad máxima aumentada

const MiniGameFlappy: React.FC<MiniGameFlappyProps> = ({ onWin }) => {
  const [pteroY, setPteroY] = useState(GAME_HEIGHT / 2);
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

  // Calcular velocidad actual basada en el score - CAMBIADO: cada 10 obstáculos
  const calculateSpeed = (score: number) => {
    const speedIncrease = Math.floor(score / 10) * SPEED_INCREASE_RATE; // Cada 10 obstáculos
    return Math.min(BASE_OBSTACLE_SPEED + speedIncrease, MAX_SPEED);
  };

  // Actualizar velocidad cuando cambia el score
  useEffect(() => {
    const newSpeed = calculateSpeed(score);
    if (newSpeed !== currentSpeed) {
      setCurrentSpeed(newSpeed);
      // Mostrar notificación de aumento de velocidad
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
      { x: GAME_WIDTH + 100, height: 120, scored: false },
      { x: GAME_WIDTH + 350, height: 180, scored: false },
    ]);
  }, []);

  // Loop principal del juego
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    gameLoopRef.current = window.setInterval(() => {
      // Actualizar posición y velocidad del pterosaurio
      setVelocity((v) => v + GRAVITY);
      setPteroY((y) => {
        const newY = y + velocity;
        // Verificar colisión con límites
        if (newY <= 0 || newY >= GAME_HEIGHT - PTERO_SIZE) {
          setGameOver(true);
          return y;
        }
        return newY;
      });

      const MIN_GAP_BETWEEN_OBSTACLES = 280;

      setObstacles((obs) => {
        // Mover obstáculos y eliminar los que salieron (usando velocidad actual)
        let newObs = obs
          .map((o) => ({ ...o, x: o.x - currentSpeed }))
          .filter((o) => o.x + OBSTACLE_WIDTH > -50);

        // Contar puntos cuando el pterosaurio pasa un obstáculo
        newObs.forEach((o) => {
          // Verificar que el pterosaurio pasó completamente el obstáculo Y que no haya sido puntuado antes
          if (!o.scored && o.x + OBSTACLE_WIDTH < 100) {
            o.scored = true;
            setScore((s) => s + 1);
          }
        });

        // Añadir nuevo obstáculo
        if (
          newObs.length === 0 ||
          newObs[newObs.length - 1].x < GAME_WIDTH - MIN_GAP_BETWEEN_OBSTACLES
        ) {
          newObs = [
            ...newObs,
            {
              x: GAME_WIDTH + 50,
              height: 80 + Math.random() * 160,
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
  }, [gameStarted, gameOver, velocity, currentSpeed]);

  // Verificar colisiones
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    obstacles.forEach((o) => {
      // Colisión con obstáculos
      if (
        o.x < 100 + PTERO_SIZE &&
        o.x + OBSTACLE_WIDTH > 100 &&
        (pteroY < o.height || pteroY + PTERO_SIZE > o.height + OBSTACLE_GAP)
      ) {
        setGameOver(true);
      }
    });
  }, [pteroY, obstacles, gameStarted, gameOver]);

  // Dar puntos extra - cada 10 obstáculos = 5 DinoPoints
  useEffect(() => {
    const currentPackage = Math.floor(score / 10); // Cada 10 obstáculos
    if (currentPackage > packagesGiven && score > 0) {
      const pointsToAdd = 5; // 5 DinoPoints por cada 10 obstáculos
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
    setPteroY(GAME_HEIGHT / 2);
    setVelocity(0);
    setObstacles([
      { x: GAME_WIDTH + 100, height: 120, scored: false },
      { x: GAME_WIDTH + 350, height: 180, scored: false },
    ]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setPackagesGiven(0);
    setCurrentSpeed(BASE_OBSTACLE_SPEED);
    setNotification(null);
  };

  // Obtener nivel de velocidad para mostrar - CAMBIADO: cada 10 obstáculos
  const getSpeedLevel = () => {
    return Math.floor(score / 10) + 1;
  };

  // Obtener color del indicador de velocidad
  const getSpeedColor = () => {
    const level = getSpeedLevel();
    if (level <= 2) return "text-green-600";
    if (level <= 4) return "text-yellow-600";
    if (level <= 6) return "text-orange-600";
    return "text-red-600";
  };

  // Mostrar velocidad actual formateada
  const getSpeedDisplay = () => {
    return currentSpeed.toFixed(1);
  };

  return (
    <div className="inline-block w-full max-w-2xl">
      {/* Marco del juego estilo Windows 98 */}
      <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-3">
        {/* Barra de título del juego */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-3 py-1 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              🎮
            </div>
            <span
              className="text-sm font-bold"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              FlappyPtero.exe - {gameStarted ? "EN JUEGO" : "LISTO"}
            </span>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              _
            </div>
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              ×
            </div>
          </div>
        </div>

        {/* Panel de estadísticas */}
        <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 mb-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div
                className="text-lg font-bold text-black"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {score}
              </div>
              <div
                className="text-xs text-black"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Obstáculos
              </div>
            </div>
            <div>
              <div
                className="text-lg font-bold text-green-600"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {user?.points || 0}
              </div>
              <div
                className="text-xs text-black"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                DinoPoints
              </div>
            </div>
            <div>
              <div
                className="text-lg font-bold text-purple-600"
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

        {/* Área de juego */}
        <div
          className="border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 relative overflow-hidden cursor-pointer mx-auto"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            background:
              "linear-gradient(to bottom, #87CEEB 0%, #87CEEB 75%, #90EE90 75%, #228B22 100%)",
            userSelect: "none",
          }}
          tabIndex={0}
          onClick={handleJump}
          onKeyDown={(e) => {
            if (e.code === "Space" || e.code === "Enter") {
              e.preventDefault();
              handleJump();
            }
          }}
        >
          {/* Indicador de velocidad en juego */}
          {gameStarted && !gameOver && (
            <div
              className="absolute top-2 right-2 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 py-1"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs text-black">Vel:</span>
                <span className={`text-xs font-bold ${getSpeedColor()}`}>
                  {getSpeedDisplay()}
                </span>
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    currentSpeed > BASE_OBSTACLE_SPEED
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                ></div>
              </div>
            </div>
          )}

          {/* Pterosaurio */}
          <div
            className="absolute flex items-center justify-center transition-transform duration-75"
            style={{
              width: PTERO_SIZE,
              height: PTERO_SIZE,
              backgroundColor: "#FFA500",
              border: "3px solid #FF8C00",
              borderRadius: "50%",
              left: 100,
              top: pteroY,
              boxShadow:
                "inset 2px 2px 0px #FFD700, inset -2px -2px 0px #CC6600",
              transform: `rotate(${Math.min(
                Math.max(velocity * 3, -30),
                30
              )}deg)`,
            }}
          >
            <span style={{ fontSize: "20px", transform: "rotate(-10deg)" }}>
              🦅
            </span>
          </div>

          {/* Obstáculos estilo Windows 98 */}
          {obstacles.map((o, i) => (
            <React.Fragment key={i}>
              {/* Parte superior */}
              <div
                className="absolute border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                style={{
                  width: OBSTACLE_WIDTH,
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
                  width: OBSTACLE_WIDTH,
                  height: GAME_HEIGHT - (o.height + OBSTACLE_GAP),
                  background:
                    "linear-gradient(135deg, #228B22 0%, #006400 50%, #004d00 100%)",
                  left: o.x,
                  top: o.height + OBSTACLE_GAP,
                  boxShadow: "inset 1px 1px 0px #32CD32",
                }}
              />
            </React.Fragment>
          ))}

          {/* Elementos decorativos con movimiento basado en velocidad */}
          <div
            className="absolute text-white opacity-70"
            style={{
              top: 30,
              left: (250 - currentSpeed * 20) % GAME_WIDTH, // Movimiento más notorio
              fontSize: "16px",
              transition: "left 0.1s ease-out",
            }}
          >
            ☁️
          </div>
          <div
            className="absolute text-white opacity-70"
            style={{
              top: 60,
              left: (380 - currentSpeed * 25) % GAME_WIDTH, // Movimiento más notorio
              fontSize: "14px",
              transition: "left 0.1s ease-out",
            }}
          >
            ☁️
          </div>
          <div
            className="absolute text-yellow-300 opacity-80"
            style={{ top: 20, right: 50, fontSize: "20px" }}
          >
            ☀️
          </div>

          {/* Pantalla de inicio */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-4 text-center">
                <h3
                  className="text-black font-bold mb-2"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  🦅 PTEROSAURIO FLAPPY
                </h3>
                <p
                  className="text-xs text-black mb-3"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  Clic para comenzar
                </p>
                <div
                  className="text-xs text-gray-600"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  5 DinoPoints cada 10 obstáculos
                  <br />⚡ La velocidad aumenta cada 10 obstáculos
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-4">
                {/* Barra de título del modal */}
                <div className="bg-gradient-to-r from-red-800 to-red-600 text-white px-2 py-1 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
                      ⚠
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      Game Over - FlappyPtero.exe
                    </span>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4 mb-3">
                  <div className="text-center">
                    <div
                      className="text-lg font-bold text-black mb-2"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🏆 RESULTADO FINAL
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div
                          className="font-bold text-black"
                          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        >
                          Obstáculos: {score}
                        </div>
                        <div
                          className={`font-bold ${getSpeedColor()}`}
                          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        >
                          Velocidad máx: {getSpeedDisplay()}
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
                  className="w-full bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100 mb-2"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ► Jugar de nuevo
                </button>
              </div>
            </div>
          )}

          {/* Notificación de puntos */}
          {notification && <Windows98Notification message={notification} />}
        </div>

        {/* Panel de controles */}
        <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 mt-3">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            <div>
              <strong>Controles:</strong>
              <br />
              • Clic: Volar hacia arriba
              <br />
              • Espacio: Volar hacia arriba
              <br />• Enter: Iniciar/Reiniciar
            </div>
            <div>
              <strong>Objetivo:</strong>
              <br />
              • Pasa entre los obstáculos
              <br />• Gana 5 DinoPoints cada 10 obstáculos
              <br />• ⚡ Velocidad aumenta cada 10 obstáculos
              <br />• ¡Consigue la puntuación más alta!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Windows98Notification: React.FC<{ message: string }> = ({ message }) => (
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
    <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-2">
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white px-2 py-1 mb-1 flex items-center">
        <div className="w-3 h-3 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black mr-2">
          💰
        </div>
        <span
          className="text-xs font-bold"
          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
        >
          DinoPoints
        </span>
      </div>
      <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-2 text-center">
        <span
          className="text-green-600 font-bold text-sm"
          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
        >
          {message}
        </span>
      </div>
    </div>
  </div>
);

export default MiniGameFlappy;
