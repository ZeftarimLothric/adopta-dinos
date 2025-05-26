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
    <div
      style={{
        display: "flex",
        justifyContent: "center", // centra horizontalmente
        alignItems: "center", // centra verticalmente
        height: "100vh", // toda la altura de la ventana
        flexDirection: "column", // para que el texto quede debajo
        gap: "1rem", // espacio entre elementos
        backgroundColor: "#f0f0f0", // opcional, para mejor contraste
      }}
    >
      <h2>Minijuego: Pterosaurio Flappy</h2>
      <MiniGameFlappy onWin={handleWin} />
      <p>Puntos actuales: {user?.points}</p>
    </div>
  );
};

export default Minijuegos;
