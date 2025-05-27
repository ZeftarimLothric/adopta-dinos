// src/pages/Home.tsx
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-teal-500 flex flex-col justify-center items-center px-6 text-center relative overflow-hidden">
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
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-3xl w-full">
        {/* Barra de título */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              🦖
            </div>
            <span className="text-sm font-bold">
              DinoAdopta - Sistema de Adopción v1.0
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

        {/* Contenido de la ventana */}
        <div className="p-8 bg-gray-300">
          <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-6 mb-6">
            <h1
              className="text-4xl font-bold text-black mb-4 tracking-wider"
              style={{
                fontFamily: "MS Sans Serif, sans-serif",
                textShadow: "2px 2px 0px #c0c0c0",
              }}
            >
              🦖 DINOADOPTA
            </h1>
            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4 mb-6">
              <p
                className="text-black text-lg leading-relaxed"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Bienvenido al Sistema de Adopción de Dinosaurios v1.0
                <br />
                Descubre criaturas prehistóricas únicas y dales un nuevo hogar.
                <br />
                Explora, elige y adopta con cariño.
              </p>
            </div>
          </div>

          {/* Botón estilo Windows 98 */}
          <Link
            to="/adopciones"
            className="inline-block bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-8 py-3 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            ► Ver Dinosaurios Disponibles
          </Link>

          {/* Imagen del dinosaurio con marco retro */}
          <div className="mt-8 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-4">
            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-2">
              <img
                src="https://static.vecteezy.com/system/resources/previews/009/378/072/non_2x/cute-cartoon-dinosaur-character-free-png.png"
                alt="Dinosaurio del sistema"
                className="w-full max-h-[200px] object-contain mx-auto pixelated"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="text-center mt-2">
              <span
                className="text-xs text-black bg-gray-200 px-2 py-1 border border-gray-400"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                mascota_dino.bmp - 128x128 pixels
              </span>
            </div>
          </div>

          {/* Indicador de sistema */}
          <div className="mt-8 bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3">
            <div
              className="flex items-center gap-2 text-sm"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-black">
                Sistema activo - {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
