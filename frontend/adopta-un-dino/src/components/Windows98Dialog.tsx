import React from "react";

interface DialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "confirm" | "info";
}

const Windows98Dialog: React.FC<DialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Sí",
  cancelText = "No",
  type = "confirm",
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 min-w-80 max-w-96">
        {/* Barra de título */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-600 flex items-center justify-center text-xs font-bold text-black">
              {type === "confirm" ? "❓" : "ℹ️"}
            </div>
            <span
              className="text-sm font-bold"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              {title}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <div className="bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200 p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{type === "confirm" ? "❓" : "ℹ️"}</div>
              <p
                className="text-black text-sm leading-relaxed flex-1"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={onConfirm}
              className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-6 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white text-sm"
              style={{ fontFamily: "MS Sans Serif, sans-serif" }}
            >
              {confirmText}
            </button>
            {type === "confirm" && (
              <button
                onClick={onCancel}
                className="bg-gray-300 border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 px-6 py-2 text-black font-bold hover:bg-gray-200 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white text-sm"
                style={{ fontFamily: "MS Sans Serif, sans-serif" }}
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Windows98Dialog;
