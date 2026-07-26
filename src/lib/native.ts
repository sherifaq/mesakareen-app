/**
 * Capacitor bridge helpers.
 *
 * Every function degrades gracefully in the browser: plugins are imported
 * dynamically and only used when running inside a native shell, so the same
 * build works on the web, in Lovable preview and inside the mobile app.
 */
import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();

export interface NativeInfo {
  platform: string;
  model?: string;
  osVersion?: string;
  online: boolean;
}

export async function initNative(
  onNetworkChange?: (online: boolean) => void,
): Promise<NativeInfo> {
  const platform = Capacitor.getPlatform();
  let online = typeof navigator === "undefined" ? true : navigator.onLine;

  // Network detection works on web too.
  try {
    const { Network } = await import("@capacitor/network");
    const status = await Network.getStatus();
    online = status.connected;
    Network.addListener("networkStatusChange", (s) => onNetworkChange?.(s.connected));
  } catch {
    /* plugin unavailable */
  }

  let model: string | undefined;
  let osVersion: string | undefined;
  try {
    const { Device } = await import("@capacitor/device");
    const info = await Device.getInfo();
    model = info.model;
    osVersion = info.osVersion;
  } catch {
    /* plugin unavailable */
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setStyle({ style: Style.Light });
      if (platform === "android") {
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
        await StatusBar.setOverlaysWebView({ overlay: false });
      }
    } catch {
      /* plugin unavailable */
    }

    try {
      const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
      await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      await Keyboard.setScroll({ isDisabled: false });
      // Expose the keyboard height so sheets/inputs can stay above it.
      Keyboard.addListener("keyboardWillShow", (info) => {
        document.documentElement.style.setProperty(
          "--keyboard-height",
          `${Math.round(info.keyboardHeight)}px`,
        );
      });
      Keyboard.addListener("keyboardWillHide", () => {
        document.documentElement.style.setProperty("--keyboard-height", "0px");
      });
    } catch {
      /* plugin unavailable */
    }

    await hideSplash();
  }

  return { platform, model, osVersion, online };
}

/**
 * Hides the launch splash screen. Safe to call repeatedly; a failsafe timer in
 * the root component calls it again so a plugin error can never leave the app
 * stuck on the splash (an automatic store rejection).
 */
export async function hideSplash(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    /* plugin unavailable */
  }
}

/** Android hardware back button + resume/pause lifecycle wiring. */
export async function registerAppLifecycle(handlers: {
  onBack?: () => boolean;
  onResume?: () => void;
  onPause?: () => void;
}): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) return () => {};
  try {
    const { App } = await import("@capacitor/app");
    const back = await App.addListener("backButton", ({ canGoBack }) => {
      const handled = handlers.onBack?.();
      if (!handled && !canGoBack) App.exitApp();
    });
    const state = await App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) handlers.onResume?.();
      else handlers.onPause?.();
    });
    return () => {
      back.remove();
      state.remove();
    };
  } catch {
    return () => {};
  }
}

export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning";

export async function haptic(style: HapticStyle = "light"): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(style === "heavy" ? 24 : 10);
    }
    return;
  }
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (style === "success") {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (style === "warning") {
      await Haptics.notification({ type: NotificationType.Warning });
    } else {
      await Haptics.impact({
        style:
          style === "heavy"
            ? ImpactStyle.Heavy
            : style === "medium"
              ? ImpactStyle.Medium
              : ImpactStyle.Light,
      });
    }
  } catch {
    /* haptics unavailable */
  }
}

export async function hideKeyboard(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    await Keyboard.hide();
  } catch {
    /* plugin unavailable */
  }
}

export async function shareText(title: string, text: string): Promise<void> {
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title, text, dialogTitle: title });
    return;
  } catch {
    /* fall through to the web share API */
  }
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
    } catch {
      /* user cancelled */
    }
  }
}

export async function openExternal(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url, presentationStyle: "popover" });
      return;
    } catch {
      /* plugin unavailable */
    }
  }
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
