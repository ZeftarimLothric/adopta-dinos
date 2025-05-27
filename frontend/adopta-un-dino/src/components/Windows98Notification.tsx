import React, { useEffect } from "react";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}

const Windows98Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "from-green-800 to-green-600";
      case "error":
        return "from-red-800 to-red-600";
      case "warning":
        return "from-yellow-800 to-yellow-600";
      case "info":
        return "from-blue-800 to-blue-600";
      default:
        return "from-blue-800 to-blue-600";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 min-w-80 max-w-96">
        {/* Barra de título */}
        <div
          className={`bg-gradient-to-r ${getColors()} text-white px-2 py-1 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              {getIcon()}
            </div>
            <span
              className="text-sm font-bold"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              Sistema DinoAdopt
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs text-black font-bold hover:bg-gray-200"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4 m-2">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getIcon()}</div>
            <div className="flex-1">
              <p
                className="text-black text-sm leading-relaxed"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Botón OK */}
        <div className="p-2 text-center">
          <button
            onClick={onClose}
            className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-6 py-1 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white text-sm"
            style={{ fontFamily: "MS Sans Serif, sans-serif" }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Windows98Notification;
