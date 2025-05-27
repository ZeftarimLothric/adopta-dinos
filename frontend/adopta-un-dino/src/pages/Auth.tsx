import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useUser();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const toggleMode = () => {
    setError(null);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = `${API_BASE_URL}/api/auth/${isLogin ? "login" : "register"}`;
      const body = isLogin ? { username, password } : { username, password }; // Solo username y password para registro

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error desconocido");
        return;
      }

      if (isLogin) {
        login(data.token, {
          username: data.username,
          role: data.role,
          points: data.points,
        });
        navigate("/");
      } else {
        // Después de registrarse, cambiar a login para iniciar sesión
        setIsLogin(true);
        setUsername("");
        setPassword("");
        setError("Registro exitoso, ahora inicia sesión.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-teal-500 flex items-center justify-center px-4 relative overflow-hidden">
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
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 w-full max-w-md">
        {/* Barra de título */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              🔐
            </div>
            <span className="text-sm font-bold">
              DinoAuth - {isLogin ? "Acceso al Sistema" : "Registro de Usuario"}
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
        <div className="p-6 bg-gray-300">
          {/* Panel de título */}
          <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-4 mb-6">
            <h2
              className="text-xl font-bold text-black text-center"
              style={{
                fontFamily: "MS Sans Serif, sans-serif",
                textShadow: "1px 1px 0px #c0c0c0",
              }}
            >
              🦖 {isLogin ? "INICIAR SESIÓN" : "REGISTRO DE USUARIO"}
            </h2>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">⚠</span>
                <span
                  className="text-red-600 text-sm font-bold"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de usuario */}
            <div>
              <label
                className="block text-black text-sm font-bold mb-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Nombre de usuario:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              />
            </div>

            {/* Campo de contraseña */}
            <div>
              <label
                className="block text-black text-sm font-bold mb-2"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Contraseña:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 px-3 py-2 text-black text-sm focus:outline-none"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                type="submit"
                className="w-full bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                ► {isLogin ? "Acceder" : "Registrar"}
              </button>

              <button
                type="button"
                onClick={toggleMode}
                className="w-full bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-4 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {isLogin ? "◄ Crear cuenta nueva" : "◄ Ya tengo cuenta"}
              </button>
            </div>
          </form>

          {/* Información del sistema */}
          <div className="mt-6 bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3">
            <div
              className="flex items-center gap-2 text-xs"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-black">
                DinoAuth v1.0 - {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
