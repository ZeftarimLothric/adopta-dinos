import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false); // Cerrar menú móvil al hacer logout
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-300 border-b-2 border-b-gray-600 p-1 relative z-30">
      {/* Versión Desktop */}
      <div className="hidden lg:flex justify-between items-center w-full">
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

        {/* Área de usuario - Derecha Desktop */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-3 py-1">
                <span
                  className="text-black text-xs font-bold"
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
                  💎 {user.points}
                </span>
              </div>

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

      {/* Versión Mobile y Tablet */}
      <div className="lg:hidden">
        {/* Header móvil */}
        <div className="flex justify-between items-center w-full">
          {/* Logo móvil */}
          <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 py-1">
            <Link
              to="/"
              className="font-bold text-black hover:bg-blue-600 hover:text-white px-1 py-1 transition-colors duration-100 text-sm"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              onClick={closeMobileMenu}
            >
              🦖 DinoAdopta
            </Link>
          </div>

          {/* Info de usuario móvil */}
          <div className="flex items-center gap-1">
            {user && (
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1">
                <span
                  className="text-black text-xs font-bold"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  💎 {user.points}
                </span>
              </div>
            )}

            {/* Botón de menú hamburguesa */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-2 py-1 text-black hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white transition-all duration-100"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <div className="flex flex-col space-y-1">
                <div
                  className={`w-4 h-0.5 bg-black transition-all duration-200 ${
                    mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></div>
                <div
                  className={`w-4 h-0.5 bg-black transition-all duration-200 ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></div>
                <div
                  className={`w-4 h-0.5 bg-black transition-all duration-200 ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></div>
              </div>
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        <div
          className={`absolute top-full left-0 right-0 bg-gray-300 border-b-2 border-b-gray-600 shadow-lg transition-all duration-300 ease-in-out z-40 ${
            mobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="p-2 space-y-2">
            {/* Información del usuario en móvil */}
            {user && (
              <div className="bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3 mb-2">
                <div className="text-center">
                  <div
                    className="text-black text-sm font-bold mb-1"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    👤 {user.username}
                  </div>
                  <div
                    className="text-black text-xs"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  >
                    💎 {user.points} DinoPoints
                  </div>
                  {user.role === "admin" && (
                    <div
                      className="bg-blue-600 text-white px-2 py-1 text-xs font-bold inline-block mt-1 rounded"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      ADMIN
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enlaces de navegación móvil */}
            <div className="space-y-1">
              <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600">
                <Link
                  to="/adopciones"
                  className="block text-black hover:bg-blue-600 hover:text-white px-3 py-2 text-sm font-bold transition-colors duration-100 w-full text-left"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  onClick={closeMobileMenu}
                >
                  🦕 Adoptar Dinosaurios
                </Link>
              </div>

              <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600">
                <Link
                  to="/minijuegos"
                  className="block text-black hover:bg-blue-600 hover:text-white px-3 py-2 text-sm font-bold transition-colors duration-100 w-full text-left"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                  onClick={closeMobileMenu}
                >
                  🎮 Minijuegos
                </Link>
              </div>

              {user?.role === "admin" && (
                <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600">
                  <Link
                    to="/admin"
                    className="block text-black hover:bg-blue-600 hover:text-white px-3 py-2 text-sm font-bold transition-colors duration-100 w-full text-left"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    onClick={closeMobileMenu}
                  >
                    ⚙️ Panel de Administración
                  </Link>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="pt-2 border-t border-gray-400">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-400 border-2 border-t-red-300 border-l-red-300 border-r-red-600 border-b-red-600 px-3 py-2 text-black text-sm font-bold hover:bg-red-300 active:border-t-red-600 active:border-l-red-600 active:border-r-red-300 active:border-b-red-300 transition-all duration-100"
                  style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                >
                  🚪 Cerrar Sesión
                </button>
              ) : (
                <div className="bg-gray-200 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600">
                  <Link
                    to="/auth"
                    className="block text-black hover:bg-blue-600 hover:text-white px-3 py-2 text-sm font-bold transition-colors duration-100 w-full text-center"
                    style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    onClick={closeMobileMenu}
                  >
                    🔐 Iniciar Sesión / Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar menú móvil */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#1b1b1b46] bg-opacity-20 z-30 lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Línea decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600"></div>
    </nav>
  );
};

export default Navbar;
