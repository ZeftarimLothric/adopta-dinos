import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

// Definición de tipos para los juegos
interface MiniGame {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  icon: string;
  category: "accion" | "cuidado" | "puzzle" | "aventura";
  difficulty: "facil" | "medio" | "dificil";
  dinoPointsReward: number;
  rewardInterval: number;
  featured: boolean;
  available: boolean;
  route: string;
  previewImage?: string;
}

// Base de datos de juegos
const MINIGAMES: MiniGame[] = [
  {
    id: "flappy-ptero",
    title: "PTEROSAURIO FLAPPY",
    shortTitle: "PTERO FLAPPY",
    description:
      "¡Ayuda al pterosaurio a volar entre los obstáculos prehistóricos! Cada 10 obstáculos superados te otorgan 20 DinoPoints. ¿Podrás superar tu récord personal y llegar al Top 10?",
    shortDescription: "Vola entre obstáculos y gana DinoPoints",
    icon: "🦅",
    category: "accion",
    difficulty: "medio",
    dinoPointsReward: 20,
    rewardInterval: 10,
    featured: true,
    available: true,
    route: "/minijuegos/flappy-ptero",
  },
  {
    id: "dino-care",
    title: "CUIDADOR DE DINOSAURIOS",
    shortTitle: "DINO CARE",
    description:
      "Cuida y alimenta a tu propio dinosaurio virtual. Mantén sus estadísticas de hambre, felicidad y energía al máximo para ganar DinoPoints constantes.",
    shortDescription: "Cuida tu dino virtual y gana puntos",
    icon: "🦕",
    category: "cuidado",
    difficulty: "facil",
    dinoPointsReward: 5,
    rewardInterval: 1,
    featured: false,
    available: false, // Próximamente
    route: "/minijuegos/dino-care",
  },
];

const Minijuegos = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtrar juegos por categoría
  const filteredGames = MINIGAMES.filter(
    (game) => activeCategory === "todos" || game.category === activeCategory
  );

  const availableGames = filteredGames.filter((game) => game.available);
  const upcomingGames = filteredGames.filter((game) => !game.available);

  const handleGameClick = (game: MiniGame) => {
    if (game.available) {
      navigate(game.route);
    } else {
      setSelectedGame(game);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      todos: "🎮",
      accion: "⚡",
      cuidado: "💝",
      puzzle: "🧩",
      aventura: "🗺️",
    };
    return icons[category as keyof typeof icons] || "🎮";
  };

  const isMobile = window.innerWidth < 640;

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

      {/* Ventana principal */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-7xl mx-auto shadow-2xl">
        {/* Barra de título */}
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

        {/* Panel de bienvenida */}
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
                  ¡Bienvenido al Arcade Prehistórico,{" "}
                  {user?.username || "Invitado"}! 👋
                </h2>
                <p
                  className="text-xs sm:text-sm text-gray-700"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  Explora nuestra colección de juegos prehistóricos y gana
                  DinoPoints
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

        {/* Filtros de categoría */}
        <div className="bg-gray-200 border-b-2 border-gray-400 p-2 sm:p-3 shadow-inner">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            {["todos", "accion", "cuidado", "puzzle", "aventura"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`border-2 px-2 sm:px-4 py-1 sm:py-2 shadow-md hover:bg-gray-200 cursor-pointer transition-all whitespace-nowrap ${
                    activeCategory === category
                      ? "bg-gradient-to-b from-gray-100 to-gray-300 border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                      : "bg-gray-300 border-t-gray-600 border-l-gray-600 border-r-white border-b-white"
                  }`}
                >
                  <span
                    className="text-xs font-bold text-black flex items-center gap-1 sm:gap-2"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    {getCategoryIcon(category)}
                    <span className="hidden sm:inline capitalize">
                      {category}
                    </span>
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-gray-300 p-2 sm:p-6">
          {/* Juegos destacados */}
          {activeCategory === "todos" && (
            <div className="mb-6">
              <h3
                className="text-lg sm:text-xl font-bold text-black mb-3 flex items-center gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                ⭐ JUEGOS DESTACADOS
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {MINIGAMES.filter((game) => game.featured).map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onClick={() => handleGameClick(game)}
                    isFeatured={true}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Juegos disponibles */}
          {availableGames.length > 0 && (
            <div className="mb-6">
              <h3
                className="text-lg sm:text-xl font-bold text-black mb-3 flex items-center gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🎮{" "}
                {activeCategory === "todos"
                  ? "TODOS LOS JUEGOS"
                  : `JUEGOS DE ${activeCategory.toUpperCase()}`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onClick={() => handleGameClick(game)}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Juegos próximamente */}
          {upcomingGames.length > 0 && (
            <div>
              <h3
                className="text-lg sm:text-xl font-bold text-black mb-3 flex items-center gap-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🚧 PRÓXIMAMENTE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onClick={() => handleGameClick(game)}
                    isComingSoon={true}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de juego no disponible */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-4 max-w-md w-full">
            <div className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white px-3 py-2 mb-3 flex items-center justify-between">
              <span
                className="text-sm font-bold"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                🚧 Próximamente
              </span>
              <button
                onClick={() => setSelectedGame(null)}
                className="w-4 h-4 bg-red-500 border border-red-700 flex items-center justify-center text-xs text-white hover:bg-red-400"
              >
                ×
              </button>
            </div>
            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4">
              <div className="text-center">
                <div className="text-4xl mb-3">{selectedGame.icon}</div>
                <h4
                  className="text-lg font-bold text-black mb-2"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  {selectedGame.title}
                </h4>
                <p
                  className="text-sm text-gray-700 mb-4"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  {selectedGame.description}
                </p>
                <div className="bg-yellow-100 border border-yellow-400 p-3 rounded">
                  <p
                    className="text-sm text-yellow-800 font-bold"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    🚧 Este juego estará disponible próximamente. ¡Mantente
                    atento a las actualizaciones!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de estado */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-300 to-gray-200 border-t-2 border-t-white p-1 sm:p-2 flex justify-between items-center text-xs z-20 shadow-lg overflow-x-auto"
        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
      >
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-black font-bold">DinoGames v2.0</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-black">🎮</span>
            <span className="text-black">
              Juegos: {availableGames.length} disponibles,{" "}
              {upcomingGames.length} próximamente
            </span>
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

// Componente para las tarjetas de juegos
const GameCard: React.FC<{
  game: MiniGame;
  onClick: () => void;
  isFeatured?: boolean;
  isComingSoon?: boolean;
  isMobile?: boolean;
}> = ({
  game,
  onClick,
  isFeatured = false,
  isComingSoon = false,
  // isMobile = false,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      facil: "text-green-600",
      medio: "text-yellow-600",
      dificil: "text-red-600",
    };
    return colors[difficulty as keyof typeof colors] || "text-gray-600";
  };

  const getDifficultyBg = (difficulty: string) => {
    const colors = {
      facil: "bg-green-100 border-green-400",
      medio: "bg-yellow-100 border-yellow-400",
      dificil: "bg-red-100 border-red-400",
    };
    return (
      colors[difficulty as keyof typeof colors] || "bg-gray-100 border-gray-400"
    );
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 sm:p-4 shadow-inner hover:bg-gray-100 cursor-pointer transition-all group ${
        isComingSoon ? "opacity-70" : ""
      }`}
    >
      <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 shadow-md">
        <div className="flex items-start gap-3">
          <div
            className={`text-3xl ${
              isFeatured ? "sm:text-4xl" : "sm:text-3xl"
            } flex-shrink-0`}
          >
            {game.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4
                className={`font-bold text-black truncate ${
                  isFeatured ? "text-base sm:text-lg" : "text-sm sm:text-base"
                }`}
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="hidden sm:inline">{game.title}</span>
                <span className="sm:hidden">{game.shortTitle}</span>
              </h4>
              {isFeatured && (
                <div className="bg-blue-600 text-white px-2 py-1 text-xs font-bold shadow-md flex-shrink-0">
                  DESTACADO
                </div>
              )}
              {isComingSoon && (
                <div className="bg-yellow-600 text-white px-2 py-1 text-xs font-bold shadow-md flex-shrink-0">
                  PRÓXIMAMENTE
                </div>
              )}
            </div>

            <p
              className={`text-gray-700 mb-3 ${
                isFeatured ? "text-xs sm:text-sm" : "text-xs"
              }`}
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden sm:inline">{game.description}</span>
              <span className="sm:hidden">{game.shortDescription}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div
                className={`px-2 py-1 border ${getDifficultyBg(
                  game.difficulty
                )}`}
              >
                <span
                  className={`font-bold ${getDifficultyColor(game.difficulty)}`}
                >
                  {game.difficulty.toUpperCase()}
                </span>
              </div>

              {game.available && (
                <div className="bg-green-100 border border-green-400 px-2 py-1">
                  <span className="text-green-600 font-bold">
                    +{game.dinoPointsReward} pts
                  </span>
                </div>
              )}

              <div className="bg-blue-100 border border-blue-400 px-2 py-1">
                <span className="text-blue-600 font-bold capitalize">
                  {game.category}
                </span>
              </div>
            </div>

            {!isComingSoon && (
              <div className="mt-3 text-right">
                <span
                  className="text-xs text-blue-600 font-bold group-hover:underline"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ► JUGAR AHORA
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Minijuegos;
