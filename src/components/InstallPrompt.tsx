import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { isNative } from "@/lib/native";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mesakareen.install.dismissed";

/** Web install prompt (A2HS). Hidden inside the native app. */
export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isNative()) return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;

    const handler = (nativeEvent: Event) => {
      nativeEvent.preventDefault();
      setEvent(nativeEvent as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !event) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div
      className="animate-rise fixed inset-x-3 z-45 rounded-2xl bg-card p-4"
      style={{
        bottom: "calc(var(--tabbar-height) + var(--safe-bottom) + 0.75rem)",
        boxShadow: "var(--shadow-float)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Download aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-foreground">ثبّت تطبيق مسكرين</p>
          <p className="text-xs text-muted-foreground">للوصول السريع والعمل بدون إنترنت</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="إخفاء"
          className="tap press grid place-items-center rounded-full text-muted-foreground active:press-active"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <button
        type="button"
        onClick={async () => {
          await event.prompt();
          await event.userChoice;
          setVisible(false);
        }}
        className="tap press mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:press-active"
      >
        تثبيت الآن
      </button>
    </div>
  );
}
