import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

interface LeaderboardEntry {
  position: number;
  username: string;
  bestScore: number;
  totalGames: number;
  totalObstacles: number;
  lastPlayed: string;
  points: number;
}

interface UserStats {
  bestScore: number;
  totalGames: number;
  totalObstacles: number;
  averageScore: number;
  rank: number | null;
  lastPlayed: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "mystats">(
    "leaderboard"
  );
  const { user } = useUser();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/users/leaderboard/flappyPtero?limit=10`
      );
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const fetchUserStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/my-stats/flappyPtero`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLeaderboard(), fetchUserStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${position}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateMobile = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-6 shadow-md">
        <div className="text-center">
          <div className="text-xl sm:text-2xl mb-2">⏳</div>
          <div
            className="text-xs sm:text-sm text-black"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            Cargando estadísticas...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 shadow-md">
      {/* Pestañas responsive */}
      <div className="bg-gray-200 border-b-2 border-gray-400 flex">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold border-r-2 border-gray-400 transition-all ${
            activeTab === "leaderboard"
              ? "bg-white border-t-2 border-t-gray-600 border-l-2 border-l-gray-600"
              : "bg-gray-300 hover:bg-gray-200"
          }`}
          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
        >
          🏆 <span className="hidden sm:inline">Top 10</span>
          <span className="sm:hidden">Top</span>
        </button>
        <button
          onClick={() => setActiveTab("mystats")}
          className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "mystats"
              ? "bg-white border-t-2 border-t-gray-600 border-l-2 border-l-gray-600 border-r-2 border-r-gray-600"
              : "bg-gray-300 hover:bg-gray-200"
          }`}
          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
        >
          📊 <span className="hidden sm:inline">Mis Estadísticas</span>
          <span className="sm:hidden">Stats</span>
        </button>
      </div>

      <div className="p-2 sm:p-4">
        {activeTab === "leaderboard" ? (
          <div>
            <h3
              className="text-sm sm:text-lg font-bold text-black mb-3 sm:mb-4 text-center"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              🏆{" "}
              <span className="hidden sm:inline">
                RANKING MUNDIAL - PTEROSAURIO FLAPPY
              </span>
              <span className="sm:hidden">RANKING PTERO FLAPPY</span>
            </h3>

            {leaderboard.length === 0 ? (
              <div className="text-center text-gray-600 py-6 sm:py-8">
                <div className="text-2xl sm:text-4xl mb-2">🦅</div>
                <div
                  className="text-xs sm:text-sm"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  ¡Sé el primero en aparecer en el ranking!
                </div>
              </div>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.username}
                    className={`border-2 p-2 sm:p-3 transition-all ${
                      entry.username === user?.username
                        ? "border-yellow-400 bg-yellow-50"
                        : index < 3
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-400 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className="text-sm sm:text-lg font-bold flex-shrink-0"
                          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        >
                          {getRankIcon(entry.position)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-bold text-black flex items-center gap-1 sm:gap-2"
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            <span className="text-xs sm:text-sm truncate">
                              {entry.username}
                            </span>
                            {entry.username === user?.username && (
                              <span className="text-xs bg-blue-500 text-white px-1 rounded flex-shrink-0">
                                TÚ
                              </span>
                            )}
                          </div>
                          <div
                            className="text-xs text-gray-600"
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            <span className="hidden sm:inline">
                              {entry.totalGames} partidas • Último:{" "}
                              {formatDate(entry.lastPlayed)}
                            </span>
                            <span className="sm:hidden">
                              {entry.totalGames} partidas •{" "}
                              {formatDateMobile(entry.lastPlayed)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-lg sm:text-xl font-bold text-blue-600"
                          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        >
                          {entry.bestScore}
                        </div>
                        <div
                          className="text-xs text-gray-600"
                          style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                        >
                          💎 {entry.points}{" "}
                          <span className="hidden sm:inline">pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3
              className="text-sm sm:text-lg font-bold text-black mb-3 sm:mb-4 text-center"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              📊 TUS ESTADÍSTICAS
            </h3>

            {userStats && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="bg-blue-100 border-2 border-blue-400 p-2 sm:p-4 text-center">
                    <div
                      className="text-lg sm:text-2xl font-bold text-blue-800"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {userStats.bestScore}
                    </div>
                    <div
                      className="text-xs text-blue-600"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🏆{" "}
                      <span className="hidden sm:inline">Mejor Puntuación</span>
                      <span className="sm:hidden">Mejor</span>
                    </div>
                  </div>

                  <div className="bg-green-100 border-2 border-green-400 p-2 sm:p-4 text-center">
                    <div
                      className="text-lg sm:text-2xl font-bold text-green-800"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {userStats.rank || "N/A"}
                    </div>
                    <div
                      className="text-xs text-green-600"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      📈{" "}
                      <span className="hidden sm:inline">Posición Mundial</span>
                      <span className="sm:hidden">Posición</span>
                    </div>
                  </div>

                  <div className="bg-purple-100 border-2 border-purple-400 p-2 sm:p-4 text-center">
                    <div
                      className="text-lg sm:text-2xl font-bold text-purple-800"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {userStats.totalGames}
                    </div>
                    <div
                      className="text-xs text-purple-600"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      🎮{" "}
                      <span className="hidden sm:inline">Partidas Jugadas</span>
                      <span className="sm:hidden">Partidas</span>
                    </div>
                  </div>

                  <div className="bg-orange-100 border-2 border-orange-400 p-2 sm:p-4 text-center">
                    <div
                      className="text-lg sm:text-2xl font-bold text-orange-800"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {userStats.averageScore}
                    </div>
                    <div
                      className="text-xs text-orange-600"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      📊 Promedio
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 border-2 border-gray-400 p-2 sm:p-4">
                  <div
                    className="text-xs sm:text-sm"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    <div className="font-bold text-black mb-2">
                      📈{" "}
                      <span className="hidden sm:inline">
                        Estadísticas Detalladas:
                      </span>
                      <span className="sm:hidden">Detalles:</span>
                    </div>
                    <div className="space-y-1">
                      <div>
                        •{" "}
                        <span className="hidden sm:inline">
                          Total de obstáculos superados:
                        </span>
                        <span className="sm:hidden">Obstáculos totales:</span>{" "}
                        <strong>{userStats.totalObstacles}</strong>
                      </div>
                      <div>
                        •{" "}
                        <span className="hidden sm:inline">
                          Promedio por partida:
                        </span>
                        <span className="sm:hidden">Promedio:</span>{" "}
                        <strong>
                          {userStats.averageScore}{" "}
                          <span className="hidden sm:inline">obstáculos</span>
                        </strong>
                      </div>
                      {userStats.lastPlayed && (
                        <div>
                          •{" "}
                          <span className="hidden sm:inline">
                            Última partida:
                          </span>
                          <span className="sm:hidden">Última:</span>{" "}
                          <strong>
                            <span className="hidden sm:inline">
                              {formatDate(userStats.lastPlayed)}
                            </span>
                            <span className="sm:hidden">
                              {formatDateMobile(userStats.lastPlayed)}
                            </span>
                          </strong>
                        </div>
                      )}
                      {userStats.rank && userStats.rank <= 10 && (
                        <div className="text-green-600 font-bold mt-2">
                          🎉 ¡Estás en el Top 10!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
