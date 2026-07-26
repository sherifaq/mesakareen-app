import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sherifaq.mesakareen",
  appName: "Mesakareen",
  // TanStack Start (nitro) writes the static client bundle + prerendered HTML here.
  webDir: "dist/mobile",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    backgroundColor: "#eef3f9",
    captureInput: true,
    // Never ship a debuggable WebView: Play Store flags it as a security issue.
    webContentsDebuggingEnabled: false,
    useLegacyBridge: false,
  },
  ios: {
    // "never" keeps the WebView flush with the screen so CSS env(safe-area-*)
    // is the single source of truth for notch / home-indicator padding.
    contentInset: "never",
    backgroundColor: "#eef3f9",
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: "mobile",
    scrollEnabled: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      // The web layer hides the splash as soon as it is interactive, with a
      // hard 3s failsafe in src/lib/native.ts so the app can never hang here.
      launchAutoHide: false,
      backgroundColor: "#eef3f9",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      // "LIGHT" = light background with dark icons (light theme).
      style: "LIGHT",
      backgroundColor: "#ffffff",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
      style: "LIGHT",
    },
    CapacitorHttp: { enabled: false },
  },
};

export default config;
