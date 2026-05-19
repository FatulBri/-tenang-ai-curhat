import { useApp } from "../context/AppContext";
import { useNotification } from "../utils/useNotification";

export function AppNotifications() {
  const { notificationsEnabled } = useApp();
  useNotification(notificationsEnabled);
  return null;
}
