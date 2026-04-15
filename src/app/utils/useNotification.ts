import { useEffect } from "react";

export function useNotification(enabled: boolean) {
  const requestAndSchedule = async () => {
    if (!("Notification" in window)) return;

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") return;

    scheduleReminder();
  };

  function scheduleReminder() {
    const now = new Date();
    // Schedule for 20:00 today (or tomorrow if already past)
    const target = new Date();
    target.setHours(20, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target.getTime() - now.getTime();
    const t = setTimeout(() => {
      new Notification("TENANG AI 💙", {
        body: "Hei, sudah curhat hari ini belum? Yuk ceritakan perasaanmu!",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "tenang-daily-reminder",
      });
      // Reschedule for next day
      scheduleReminder();
    }, delay);

    return () => clearTimeout(t);
  }

  useEffect(() => {
    if (!enabled) return;
    requestAndSchedule();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps
}
