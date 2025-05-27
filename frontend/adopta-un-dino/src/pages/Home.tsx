import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 flex flex-col justify-center items-center px-2 sm:px-6 text-center relative overflow-hidden">
      {/* Patrón de fondo retro responsivo */}
      <div className="absolute inset-0 opacity-15 sm:opacity-20">
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

      {/* Ventana principal estilo Windows 98 - completamente responsiva */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full mx-2 sm:mx-4 shadow-2xl">
        {/* Barra de título responsiva */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black rounded-sm flex-shrink-0">
              🦖
            </div>
            <span
              className="text-xs sm:text-sm lg:text-base font-bold tracking-wide truncate"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden sm:inline">
                DinoAdopta - Sistema de Adopción v1.0
              </span>
              <span className="sm:hidden">DinoAdopta v1.0</span>
            </span>
            <div className="hidden md:block bg-blue-900 px-2 py-1 rounded text-xs border border-blue-700 flex-shrink-0">
              PREMIUM
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer transition-colors">
              _
            </div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs hover:bg-gray-200 cursor-pointer transition-colors">
              □
            </div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 border border-red-700 flex items-center justify-center text-xs text-white hover:bg-red-400 cursor-pointer transition-colors">
              ×
            </div>
          </div>
        </div>

        {/* Barra de menú responsiva */}
        <div className="bg-gray-200 border-b border-gray-400 p-1 flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { icon: "📁", label: "Archivo" },
              { icon: "📋", label: "Ver" },
              { icon: "🔧", label: "Config" },
              { icon: "❓", label: "Ayuda" },
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

          <div className="bg-gray-300 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1">
            <span
              className="text-xs text-black font-bold"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="hidden sm:inline">
                🕒 {new Date().toLocaleTimeString()}
              </span>
              <span className="sm:hidden">🕒</span>
            </span>
          </div>
        </div>

        {/* Contenido de la ventana - completamente responsivo */}
        <div className="p-3 sm:p-6 lg:p-8 bg-gray-300">
          {/* Panel principal */}
          <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 shadow-inner">
            <h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-2 sm:mb-4 tracking-wider text-center"
              style={{
                fontFamily: "MS Sans Serif, sans-serif",
                textShadow: "1px 1px 0px #c0c0c0, 2px 2px 0px #a0a0a0",
              }}
            >
              🦖 DINO-ADOPTA
            </h1>

            {/* Subtítulo responsivo */}
            <div className="bg-blue-800 text-white px-2 sm:px-3 py-1 sm:py-2 mb-3 sm:mb-4 text-center border-2 border-blue-900">
              <span
                className="text-xs sm:text-sm lg:text-base font-bold"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="hidden sm:inline">
                  Sistema Profesional de Adopción Prehistórica
                </span>
                <span className="sm:hidden">Adopción Prehistórica</span>
              </span>
            </div>

            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 shadow-lg">
              <p
                className="text-black text-sm sm:text-base lg:text-lg leading-relaxed text-center"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="hidden sm:inline">
                  Bienvenido al Sistema de Adopción de Dinosaurios v1.0
                  <br />
                  Descubre criaturas prehistóricas únicas y dales un nuevo
                  hogar.
                  <br />
                  Explora, elige y adopta con cariño.
                </span>
                <span className="sm:hidden">
                  Bienvenido al sistema de adopción
                  <br />
                  Descubre dinosaurios únicos
                  <br />
                  Explora y adopta con cariño
                </span>
              </p>
            </div>

            {/* Botón principal estilo Windows 98 - responsivo */}
            <div className="text-center">
              <Link
                to="/adopciones"
                className="inline-block bg-gradient-to-r from-gray-300 to-gray-400 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-black font-bold hover:from-gray-200 hover:to-gray-300 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100 shadow-lg hover:shadow-xl text-sm sm:text-base"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="flex items-center gap-2">
                  ►{" "}
                  <span className="hidden sm:inline">
                    Ver Dinosaurios Disponibles
                  </span>
                  <span className="sm:hidden">Ver Dinosaurios</span>
                  <span className="hidden lg:inline">🦕</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Imagen del dinosaurio con marco retro - responsiva */}
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-2 sm:p-4 shadow-lg">
            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-1 sm:p-2 overflow-hidden">
              <img
                src="https://static.vecteezy.com/system/resources/previews/009/378/072/non_2x/cute-cartoon-dinosaur-character-free-png.png"
                alt="Dinosaurio del sistema"
                className="w-full max-h-32 sm:max-h-48 lg:max-h-64 object-contain mx-auto pixelated transition-transform hover:scale-105"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='80'%3E🦕%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="text-center mt-1 sm:mt-2">
              <span
                className="text-xs text-black bg-gray-200 px-1 sm:px-2 py-1 border border-gray-400 inline-block"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                <span className="hidden sm:inline">
                  mascota_dino.bmp - 128x128 pixels
                </span>
                <span className="sm:hidden">dino.bmp</span>
              </span>
            </div>
          </div>

          {/* Panel de información del sistema - responsivo */}
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-2 sm:p-3 shadow-inner">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-black">
                  <span className="hidden sm:inline">
                    Sistema activo - {new Date().toLocaleString()}
                  </span>
                  <span className="sm:hidden">
                    Sistema activo - {new Date().toLocaleTimeString()}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-black">
                  <span className="hidden sm:inline">
                    Servidor: DinoAdopt-Server-01
                  </span>
                  <span className="sm:hidden">Servidor online</span>
                </span>
              </div>
            </div>
          </div>

          {/* Panel de novedades - solo en desktop */}
          <div className="hidden lg:block mt-6 bg-yellow-100 border-2 border-yellow-400 border-t-yellow-600 border-l-yellow-600 border-r-yellow-200 border-b-yellow-200 p-4 shadow-inner">
            <h3
              className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              📰 Novedades del Sistema
            </h3>
            <ul
              className="text-xs text-yellow-700 space-y-1"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <li>• Sistema de puntos DinoPoints mejorado</li>
              <li>• Minijuegos para ganar puntos extra</li>
              <li>• Interfaz optimizada para todos los dispositivos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
