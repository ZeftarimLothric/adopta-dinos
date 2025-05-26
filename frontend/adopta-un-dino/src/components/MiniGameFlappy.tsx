import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";

interface MiniGameFlappyProps {
  onWin: (points: number) => void;
}

const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const OBSTACLE_GAP = 150;
const OBSTACLE_WIDTH = 50;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const MiniGameFlappy: React.FC<MiniGameFlappyProps> = ({ onWin }) => {
  const [pteroY, setPteroY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<{ x: number; height: number }[]>(
    []
  );
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [packagesGiven, setPackagesGiven] = useState(0);
  const { user, updateUser } = useUser();
  const [notification, setNotification] = useState<string | null>(null);

  const gameLoopRef = useRef<number | null>(null);

  // Salto al hacer click
  const handleJump = () => {
    if (!gameOver) setVelocity(JUMP_STRENGTH);
  };

  // Inicializar obstáculos
  useEffect(() => {
    setObstacles([
      { x: GAME_WIDTH + 100, height: 200 },
      { x: GAME_WIDTH + 300, height: 250 },
    ]);
  }, []);

  // Loop principal del juego
  useEffect(() => {
    if (gameOver) return;

    gameLoopRef.current = window.setInterval(() => {
      // Actualizar posición y velocidad del pterosaurio
      setVelocity((v) => v + GRAVITY);
      setPteroY((y) => Math.min(Math.max(y + velocity, 0), GAME_HEIGHT));

      const MIN_GAP_BETWEEN_OBSTACLES = 300; // distancia mínima en pixeles entre obstáculos

      setObstacles((obs) => {
        // Mover obstáculos y eliminar los que salieron
        let newObs = obs
          .map((o) => ({ ...o, x: o.x - 5 }))
          .filter((o) => o.x + OBSTACLE_WIDTH > 0);

        // Añadir nuevo obstáculo solo si no hay o si el último está suficientemente lejos
        if (
          newObs.length === 0 ||
          newObs[newObs.length - 1].x < GAME_WIDTH - MIN_GAP_BETWEEN_OBSTACLES
        ) {
          newObs = [
            ...newObs,
            { x: GAME_WIDTH + 100, height: 100 + Math.random() * 300 },
          ];
        }

        return newObs;
      });

      // Colisiones simples
      obstacles.forEach((o) => {
        if (
          o.x < 100 + 40 && // ptero X (fijo) + ancho
          o.x + OBSTACLE_WIDTH > 100 && // ptero X
          (pteroY < o.height || pteroY > o.height + OBSTACLE_GAP)
        ) {
          setGameOver(true);
        } else if (o.x + OBSTACLE_WIDTH === 100) {
          // Pasó un obstáculo, sumar punto
          setScore((s) => s + 1);
        }
      });

      // Ptero toca suelo o techo
      if (pteroY >= GAME_HEIGHT || pteroY <= 0) {
        setGameOver(true);
      }
    }, 30);

    return () => {
      if (gameLoopRef.current) window.clearInterval(gameLoopRef.current);
    };
  }, [gameOver, velocity, pteroY, obstacles]);

  // useEffect para dar puntos extra
  useEffect(() => {
    const currentPackage = Math.floor(score / 10);
    if (currentPackage > packagesGiven) {
      onWin(10); // si aún necesitas esto externamente

      // Actualizar los puntos del usuario
      if (user) {
        const newUser = { ...user, points: user.points + 10 };
        updateUser(newUser); // <-- Aquí se actualiza el contexto y localStorage
      }
      setNotification("+10 puntos!");
      setTimeout(() => setNotification(null), 2000);

      setPackagesGiven(currentPackage);
    }
  }, [score, packagesGiven, onWin, user, updateUser]);

  // Reiniciar
  const resetGame = () => {
    setPteroY(GAME_HEIGHT / 2);
    setVelocity(0);
    setObstacles([
      { x: GAME_WIDTH + 100, height: 200 },
      { x: GAME_WIDTH + 300, height: 250 },
    ]);
    setScore(0);
    setGameOver(false);
    setPackagesGiven(0);
  };

  return (
    <div
      style={{
        border: "2px solid black",
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        position: "relative",
        overflow: "hidden",
        background: "skyblue",
        userSelect: "none",
      }}
      tabIndex={0}
      onClick={handleJump}
      onKeyDown={(e) => {
        if (e.code === "Space") handleJump();
      }}
    >
      {/* Pterosaurio */}
      <div
        style={{
          position: "absolute",
          width: 40,
          height: 30,
          backgroundColor: "orange",
          borderRadius: 10,
          left: 100,
          top: pteroY,
          transition: "top 0.03s linear",
        }}
      >
        🦖
      </div>

      {/* Obstáculos */}
      {obstacles.map((o, i) => (
        <React.Fragment key={i}>
          {/* Parte superior */}
          <div
            style={{
              position: "absolute",
              width: OBSTACLE_WIDTH,
              height: o.height,
              backgroundColor: "green",
              left: o.x,
              top: 0,
            }}
          />
          {/* Parte inferior */}
          <div
            style={{
              position: "absolute",
              width: OBSTACLE_WIDTH,
              height: GAME_HEIGHT - (o.height + OBSTACLE_GAP),
              backgroundColor: "green",
              left: o.x,
              top: o.height + OBSTACLE_GAP,
            }}
          />
        </React.Fragment>
      ))}

      {/* Puntuación */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        Puntos: {score}
      </div>

      {/* Game Over */}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: GAME_HEIGHT / 2 - 50,
            left: GAME_WIDTH / 2 - 100,
            width: 200,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: 20,
            textAlign: "center",
            borderRadius: 10,
          }}
        >
          <p>¡Juego terminado! Puntaje final: {score}</p>
          <button onClick={resetGame}>Volver a jugar</button>
        </div>
      )}
      {notification && <CustomNotification message={notification} />}
    </div>
  );
};

const CustomNotification: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      position: "absolute",
      top: 50,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#222",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: 8,
      zIndex: 10,
      fontSize: 18,
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    }}
  >
    {message}
  </div>
);

export default MiniGameFlappy;
