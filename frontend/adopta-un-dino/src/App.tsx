import React, { type JSX } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Adopciones from "./pages/Adopciones";
import AdminPanel from "./pages/AdminPanel";
import Auth from "./pages/Auth";
import { UserProvider, useUser } from "./context/UserContext";
import Navbar from "./components/Navbar";
import Minijuegos from "./pages/Minijuegos";
import FlappyPtero from "./pages/FlappyPtero";

// Componente para rutas protegidas (ejemplo Admin)
const ProtectedRoute: React.FC<{
  children: JSX.Element;
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Cargando...</div>; // o un spinner

  if (!user) return <Navigate to="/auth" replace />;

  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/adopciones"
            element={
              <ProtectedRoute>
                <Adopciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minijuegos"
            element={
              <ProtectedRoute>
                <Minijuegos />
              </ProtectedRoute>
            }
          />
          {/* ✅ Nueva ruta para el juego específico */}
          <Route
            path="/minijuegos/flappy-ptero"
            element={
              <ProtectedRoute>
                <FlappyPtero />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />
          {/* Ruta fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
