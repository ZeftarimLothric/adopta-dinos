import MiniGameFlappy from "../components/MiniGameFlappy";
import { useUser } from "../context/UserContext";

const Minijuegos = () => {
  const { user, updateUser } = useUser();

  const handleWin = (points: number) => {
    alert(`Ganaste ${points} puntos!`);
    if (user) {
      const updatedUser = { ...user, points: user.points + points };
      updateUser(updatedUser);
      // Aquí también podrías hacer un fetch a backend para guardar puntos
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
