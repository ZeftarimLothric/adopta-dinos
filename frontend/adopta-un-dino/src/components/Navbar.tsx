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
    <nav className="bg-indigo-800 p-4 flex justify-between items-center text-white shadow-md">
      <Link to="/" className="font-bold text-xl hover:text-pink-400 transition">
        DinoAdopta
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/adopciones" className="hover:text-pink-400 transition">
          Adoptar
        </Link>
        <Link to="/minijuegos" className="hover:text-pink-400 transition">
          Minijuegos
        </Link>

        {user?.role === "admin" && (
          <Link to="/admin" className="hover:text-pink-400 transition">
            Panel Admin
          </Link>
        )}

        {user ? (
          <>
            <span className="hidden sm:inline-block">
              {user.username} ({user.points} pts)
            </span>
            <button
              onClick={handleLogout}
              className="underline hover:text-pink-400 ml-4"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/auth" className="underline hover:text-pink-400 transition">
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
