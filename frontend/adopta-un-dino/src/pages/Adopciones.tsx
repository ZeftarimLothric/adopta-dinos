import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../context/UserContext";
import { useNotifications } from "../hooks/useNotifications";
import Windows98Dialog from "../components/Windows98Dialog";
import Windows98Notification from "../components/Windows98Notification";

interface AdoptedBy {
  _id: string;
  username: string;
}

interface Dinosaur {
  _id: string;
  name: string;
  type: string;
  period: string;
  adoptionCost: number;
  description?: string | null;
  rarity: string;
  adoptedBy?: AdoptedBy | null;
}

interface AdoptResponse {
  message: string;
  dino: Dinosaur;
  remainingPoints: number;
}

interface JwtPayload {
  id: string;
}

const rarityColors: Record<string, string> = {
  Common: "bg-green-200 text-green-800 border-green-400",
  Rare: "bg-yellow-200 text-yellow-800 border-yellow-400",
  Legendary: "bg-red-200 text-red-800 border-red-400",
};

const Adopciones = () => {
  const { user, updateUser, token } = useUser();
  const [dinos, setDinos] = useState<Dinosaur[]>([]);
  const [selectedDino, setSelectedDino] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    show: boolean;
    type: "adopt" | "release";
    dino: Dinosaur | null;
  }>({ show: false, type: "adopt", dino: null });

  const { notifications, removeNotification, success, error, warning } =
    useNotifications();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Obtener el id de usuario desde el token JWT guardado en localStorage
  let currentUserId = "";
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      currentUserId = decoded.id;
    } catch (error) {
      console.error("Error al decodificar token:", error);
    }
  }

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dinos`)
      .then((res) => res.json())
      .then((data: Dinosaur[]) => setDinos(data))
      .catch((err) => {
        console.error("Error fetching dinos:", err);
        error("Error al cargar la lista de dinosaurios");
      });
  }, [BACKEND_URL]);

  const handleReleaseDino = async (dino: Dinosaur) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${dino._id}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Error al liberar dinosaurio");

      const data = await res.json();
      setDinos((prev) => prev.map((d) => (d._id === dino._id ? data.dino : d)));
      success(
        `¡${dino.name} ha sido liberado exitosamente! Ahora puede ser adoptado por otros usuarios.`
      );
      setDialogState({ show: false, type: "adopt", dino: null });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("Error desconocido:", error);
      }
    }
  };

  const handleAdoptDino = async (dino: Dinosaur) => {
    if (!user) {
      error("Error: Datos de usuario no disponibles");
      return;
    }

    if (user.points < dino.adoptionCost) {
      warning(
        `Necesitas ${dino.adoptionCost} DinoPoints para adoptar a ${dino.name}. Actualmente tienes ${user.points} DinoPoints.`
      );
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/dinos/${dino._id}/adopt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al adoptar");

      const data: AdoptResponse = await res.json();

      // Actualizo lista de dinos
      setDinos((prev) => prev.map((d) => (d._id === dino._id ? data.dino : d)));
      // Actualizo puntos en el contexto
      updateUser({ ...user, points: data.remainingPoints });
      success(
        `¡Felicidades! Has adoptado a ${dino.name}. Te quedan ${data.remainingPoints} DinoPoints.`
      );
      setDialogState({ show: false, type: "adopt", dino: null });
    } catch (err) {
      console.error("Error al adoptar:", err);
      error(
        `No se pudo completar la adopción de ${dino.name}. Por favor, inténtalo de nuevo.`
      );
    }
  };

  const showAdoptDialog = (dino: Dinosaur) => {
    setDialogState({ show: true, type: "adopt", dino });
  };

  const showReleaseDialog = (dino: Dinosaur) => {
    setDialogState({ show: true, type: "release", dino });
  };

  return (
    <div className="min-h-screen bg-teal-500 p-4 pb-16 relative overflow-hidden">
      {/* Patrón de fondo retro */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            #ffffff 1deg,
            transparent 2deg,
            transparent 30deg
          )`,
          }}
        ></div>
      </div>

      {/* Ventana principal del explorador */}
      <div className="relative z-10 bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 max-w-7xl mx-auto">
        {/* Barra de título */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              🦕
            </div>
            <span className="text-sm font-bold">
              Centro de Adopción Prehistórica - DinoManager v2.1
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

        {/* Barra de herramientas */}
        <div className="bg-gray-200 border-b border-gray-400 p-2 flex items-center gap-2">
          <div className="bg-gray-300 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1">
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              📁 Archivo
            </span>
          </div>
          <div className="bg-gray-300 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1">
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              📋 Ver
            </span>
          </div>
          <div className="bg-gray-300 border border-gray-400 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-3 py-1">
            <span
              className="text-xs font-bold text-black"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              🔧 Herramientas
            </span>
          </div>

          <div className="ml-auto bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-3 py-1">
            <span
              className="text-xs text-black font-bold"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              {dinos.length} dinosaurios encontrados
            </span>
          </div>
        </div>

        {/* Área de contenido principal */}
        <div className="bg-gray-300 p-4">
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4 mb-4">
            <h1
              className="text-2xl font-bold text-black mb-2 text-center"
              style={{
                fontFamily: "MS Sans Serif, sans-serif",
                textShadow: "1px 1px 0px #c0c0c0",
              }}
            >
              🦕 CENTRO DE ADOPCIÓN PREHISTÓRICA
            </h1>
            <p
              className="text-sm text-black text-center"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              Selecciona un dinosaurio para ver sus detalles y opciones de
              adopción
            </p>
          </div>

          {/* Lista de dinosaurios estilo explorador */}
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {dinos.map((dino) => (
                <div
                  key={dino._id}
                  className={`bg-gray-200 border-2 border-gray-400 ${
                    selectedDino === dino._id
                      ? "border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-blue-200"
                      : "border-t-white border-l-white border-r-gray-600 border-b-gray-600"
                  } p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-100`}
                  onClick={() =>
                    setSelectedDino(selectedDino === dino._id ? null : dino._id)
                  }
                >
                  {/* Icono del dinosaurio */}
                  <div className="text-center mb-2">
                    <div className="w-12 h-12 bg-gray-300 border border-gray-600 mx-auto flex items-center justify-center text-2xl">
                      🦕
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="text-center">
                    <h3
                      className="text-sm font-bold text-black mb-1"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {dino.name}
                    </h3>
                    <p
                      className="text-xs text-black mb-1"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {dino.type}
                    </p>

                    {/* Etiqueta de rareza */}
                    <div
                      className={`inline-block px-2 py-1 text-xs border ${
                        rarityColors[dino.rarity] ??
                        "bg-gray-200 text-gray-700 border-gray-400"
                      } mb-2`}
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {dino.rarity}
                    </div>

                    {/* Estado de adopción */}
                    <div
                      className="text-xs text-black"
                      style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                    >
                      {dino.adoptedBy ? (
                        <span className="text-red-700">● Adoptado</span>
                      ) : (
                        <span className="text-green-700">● Disponible</span>
                      )}
                    </div>
                  </div>

                  {/* Panel expandido */}
                  {selectedDino === dino._id && (
                    <div className="mt-3 pt-3 border-t border-gray-400">
                      <div
                        className="bg-white border border-gray-400 p-2 mb-3 text-xs"
                        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                      >
                        <p className="text-black mb-1">
                          <strong>Período:</strong>{" "}
                          {dino.period ?? "Desconocido"}
                        </p>
                        <p className="text-black mb-1">
                          <strong>Costo:</strong> {dino.adoptionCost} DinoPoints
                        </p>
                        <p className="text-black mb-1">
                          <strong>Descripción:</strong>{" "}
                          {dino.description ?? "No disponible"}
                        </p>
                        {dino.adoptedBy && (
                          <p className="text-black">
                            <strong>Adoptado por:</strong>{" "}
                            {dino.adoptedBy.username}
                          </p>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-col gap-2">
                        {!dino.adoptedBy && (
                          <button
                            className="bg-green-600 border-2 border-t-green-400 border-l-green-400 border-r-green-800 border-b-green-800 text-white px-3 py-1 text-xs font-bold hover:bg-green-500 active:border-t-green-800 active:border-l-green-800 active:border-r-green-400 active:border-b-green-400 transition-all duration-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              showAdoptDialog(dino);
                            }}
                            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
                          >
                            ► Adoptar
                          </button>
                        )}

                        {dino.adoptedBy &&
                          dino.adoptedBy._id === currentUserId && (
                            <button
                              className="bg-red-600 border-2 border-t-red-400 border-l-red-400 border-r-red-800 border-b-red-800 text-white px-3 py-1 text-xs font-bold hover:bg-red-500 active:border-t-red-800 active:border-l-red-800 active:border-r-red-400 active:border-b-red-400 transition-all duration-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                showReleaseDialog(dino);
                              }}
                              style={{
                                fontFamily: "MS Sans Serif, sans-serif",
                              }}
                            >
                              ✖ Liberar
                            </button>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Información del sistema */}
          <div className="mt-4 bg-gray-200 border-2 border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white p-3">
            <div
              className="flex justify-between items-center text-xs"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              <span className="text-black">
                Sistema: Windows DinoAdopt 98 SE
              </span>
              <span className="text-black">
                Memoria libre: {Math.floor(Math.random() * 100) + 50} MB
              </span>
              <span className="text-black">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de estado fija */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-300 border-t-2 border-t-white p-1 flex justify-between items-center text-xs z-20"
        style={{ fontFamily: "MS Sans Serif, sans-serif" }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 border border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1">
            <span className="text-black">DinoAdopt v2.1</span>
          </div>
          {user && (
            <div className="bg-gray-200 border border-gray-400 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1">
              <span className="text-black">DinoPoints: {user.points}</span>
            </div>
          )}
        </div>
        <div className="text-black">{new Date().toLocaleTimeString()}</div>
      </div>

      {/* Notificaciones */}
      <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
        {notifications.map((notification) => (
          <Windows98Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Dialog de confirmación */}
      {dialogState.show && dialogState.dino && (
        <Windows98Dialog
          title={
            dialogState.type === "adopt"
              ? "Confirmar Adopción"
              : "Confirmar Liberación"
          }
          message={
            dialogState.type === "adopt"
              ? `¿Estás seguro de que quieres adoptar a ${dialogState.dino.name} por ${dialogState.dino.adoptionCost} DinoPoints?`
              : `¿Estás seguro de que quieres liberar a ${dialogState.dino.name}? Una vez liberado, otros usuarios podrán adoptarlo.`
          }
          onConfirm={() => {
            if (dialogState.type === "adopt") {
              handleAdoptDino(dialogState.dino!);
            } else {
              handleReleaseDino(dialogState.dino!);
            }
          }}
          onCancel={() =>
            setDialogState({ show: false, type: "adopt", dino: null })
          }
          confirmText={dialogState.type === "adopt" ? "Adoptar" : "Liberar"}
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default Adopciones;
