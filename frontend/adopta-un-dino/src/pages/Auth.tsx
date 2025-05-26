import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

type Role = "admin" | "user";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [error, setError] = useState<string | null>(null);
  const { login } = useUser();
  const navigate = useNavigate();

  const toggleMode = () => {
    setError(null);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { username, password }
        : { username, password, role };

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
    <div className="min-h-screen bg-[url('/dino-bg.png')] bg-cover bg-center flex items-center justify-center">
      <div className="backdrop-blur-md bg-white/30 p-8 rounded-2xl shadow-2xl w-96 max-w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-black drop-shadow">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </h2>

        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-white/80 rounded px-4 py-2 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/80 rounded px-4 py-2 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {!isLogin && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-white/80 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          )}

          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition"
          >
            {isLogin ? "Entrar" : "Registrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-black drop-shadow">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            className="text-pink-400 underline hover:text-pink-600"
            onClick={toggleMode}
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
