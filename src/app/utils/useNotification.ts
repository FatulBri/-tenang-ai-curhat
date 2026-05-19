import { useEffect, useRef, type MutableRefObject } from "react";

function msUntil(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function scheduleDaily(
  hour: number,
  minute: number,
  tag: string,
  title: string,
  body: string,
  timersRef: MutableRefObject<ReturnType<typeof setTimeout>[]>
) {
  const delay = msUntil(hour, minute);
  const t = setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag,
      });
    }
    scheduleDaily(hour, minute, tag, title, body, timersRef);
  }, delay);
  timersRef.current.push(t);
}

export function useNotification(enabled: boolean) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!enabled) return;
    if (!("Notification" in window)) return;

    const setup = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") return;

      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      scheduleDaily(
        9,
        0,
        "tenang-mood-checkin",
        "TENANG AI — Cek mood 💙",
        "Bagaimana perasaanmu pagi ini? Luangkan sebentar untuk mencatat mood.",
        timersRef
      );

      scheduleDaily(
        20,
        0,
        "tenang-curhat-reminder",
        "TENANG AI 💙",
        "Sudah curhat hari ini? Ceritakan perasaanmu di ruang aman ini.",
        timersRef
      );
    };

    setup();

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [enabled]);
}
