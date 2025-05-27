import { useState } from "react";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const success = (message: string) => addNotification(message, "success");
  const error = (message: string) => addNotification(message, "error");
  const warning = (message: string) => addNotification(message, "warning");
  const info = (message: string) => addNotification(message, "info");

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
};
