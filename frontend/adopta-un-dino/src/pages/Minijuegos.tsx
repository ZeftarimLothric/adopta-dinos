import MiniGameFlappy from "../components/MiniGameFlappy";
import { useUser } from "../context/UserContext";

const Minijuegos = () => {
  const { user } = useUser();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

  return (
    <div className="min-h-screen bg-teal-500 p-4 relative overflow-hidden">
      {/* Patrón de fondo retro */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            #ffffff 2px,
            #ffffff 4px
          )`,
          }}
        ></div>
      </div>

      {/* Ventana principal estilo Windows 98 */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-6xl mx-auto">
        {/* Barra de título */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              🎮
            </div>
            <span className="text-sm font-bold">
              DinoGames - Centro de Entretenimiento v1.0
            </span>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              _
            </div>
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              □
            </div>
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs">
              ×
            </div>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div className="bg-gray-200 border-b border-gray-400 p-2 flex items-center gap-2">
          <div className="bg-gray-300 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1">
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              🎮 Juegos
            </span>
          </div>
          <div className="bg-gray-300 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1">
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              🏆 Puntuaciones
            </span>
          </div>
          <div className="bg-gray-300 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1">
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              ⚙️ Configuración
            </span>
          </div>

          <div className="ml-auto bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-3 py-1">
            <span
              className="text-xs text-black font-bold"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              DinoPoints: {user?.points || 0}
            </span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-gray-300 p-6">
          {/* Panel de título del juego */}
          <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-4 mb-6">
            <h1
              className="text-2xl font-bold text-black text-center mb-2"
              style={{
                fontFamily: "MS Sans Serif, sans-serif",
                textShadow: "1px 1px 0px #c0c0c0",
              }}
            >
              🦅 PTEROSAURIO FLAPPY
            </h1>
            <p
              className="text-sm text-black text-center"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              ¡Ayuda al pterosaurio a volar entre los obstáculos y ganar
              DinoPoints!
            </p>
          </div>

          {/* Área del juego */}
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4 mb-4">
            <div className="flex justify-center">
              <MiniGameFlappy onWin={handleWin} />
            </div>
          </div>

          {/* Panel de información */}
          <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Puntos actuales */}
              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3">
                <div className="text-center">
                  <div
                    className="text-lg font-bold text-black mb-1"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    💰 {user?.points || 0}
                  </div>
                  <div
                    className="text-xs text-black"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    DinoPoints Actuales
                  </div>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3">
                <div
                  className="text-xs text-black"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  <strong>Controles:</strong>
                  <br />
                  • Clic o Espacio: Volar
                  <br />
                  • Evita los obstáculos
                  <br />• Gana puntos por cada obstáculo superado
                </div>
              </div>

              {/* Estado del juego */}
              <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3">
                <div className="text-center">
                  <div
                    className="text-sm font-bold text-black mb-1"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    🎮 JUEGO ACTIVO
                  </div>
                  <div
                    className="text-xs text-black"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    Sistema listo para jugar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de estado fija */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-300 border-t-2 border-t-white p-1 flex justify-between items-center text-xs z-20"
        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-black">DinoGames v1.0</span>
          </div>
        </div>
        <div className="text-black">
          Usuario: {user?.username || "Invitado"} |{" "}
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Minijuegos;
