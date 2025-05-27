import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-300 border-b-2 border-b-gray-600 p-1 flex justify-between items-center relative z-30">
      {/* Barra de menú estilo Windows 98 */}
      <div className="flex items-center w-full">
        {/* Logo/Título */}
        <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1 mr-2">
          <Link
            to="/"
            className="font-bold text-black hover:bg-blue-600 hover:text-white px-2 py-1 transition-colors duration-100"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            🦖 DinoAdopta
          </Link>
        </div>

        {/* Menú principal */}
        <div className="flex items-center gap-1">
          <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 py-1">
            <Link
              to="/adopciones"
              className="text-black hover:bg-blue-600 hover:text-white px-2 py-1 text-sm font-bold transition-colors duration-100"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              Adoptar
            </Link>
          </div>

          <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 py-1">
            <Link
              to="/minijuegos"
              className="text-black hover:bg-blue-600 hover:text-white px-2 py-1 text-sm font-bold transition-colors duration-100"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              Minijuegos
            </Link>
          </div>

          {user?.role === "admin" && (
            <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 py-1">
              <Link
                to="/admin"
                className="text-black hover:bg-blue-600 hover:text-white px-2 py-1 text-sm font-bold transition-colors duration-100"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Admin
              </Link>
            </div>
          )}
        </div>

        {/* Área de usuario - Derecha */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              {/* Panel de usuario */}
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-3 py-1">
                <span
                  className="text-black text-xs font-bold hidden sm:inline-block"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  Usuario: {user.username}
                </span>
              </div>

              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-3 py-1">
                <span
                  className="text-black text-xs font-bold"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  Puntos: {user.points}
                </span>
              </div>

              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1 text-black text-xs font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Salir
              </button>
            </>
          ) : (
            <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1">
              <Link
                to="/auth"
                className="text-black text-xs font-bold hover:bg-blue-600 hover:text-white px-2 py-1 transition-colors duration-100"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Línea decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600"></div>
    </nav>
  );
};

export default Navbar;
