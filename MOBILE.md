# Mesakareen — Native Mobile (Capacitor)

App name: **Mesakareen** · Package ID: **com.sherifaq.mesakareen** · Portrait only · Light theme

## Build & run

```bash
npm run build:mobile   # static SPA bundle -> dist/mobile
npx cap sync           # copy bundle + plugins into android/ & ios/
npx cap open android   # Android Studio
npx cap open ios       # Xcode (macOS + CocoaPods: cd ios/App && pod install)
```

`npm run build` still produces the SSR/PWA web app; native builds always use `dist/mobile`.

## Native config
- `capacitor.config.ts` — app id/name, `webDir: dist/mobile`, splash screen, keyboard, status bar.
- Portrait lock: `android:screenOrientation="portrait"` (AndroidManifest) + `UISupportedInterfaceOrientations` (Info.plist).
- Light theme: `windowLightStatusBar` (Android styles.xml) + `UIUserInterfaceStyle: Light` (Info.plist).
- Icons/splash regenerate from `assets/` with `npx capacitor-assets generate`.

## Native features
Wrapped in `src/lib/native.ts` with web fallbacks: Splash Screen, Status Bar, Keyboard, Haptics, Share, Network, Device, App (back button / resume).

## Offline
Food database (`public/data/foods.json`) is bundled into the native app and cached by the service worker on web, so search works offline after first load.

## Store-readiness checklist (applied)
- Portrait-only lock on both platforms; light status bar / light appearance forced.
- Medical disclaimer on the search screen + full disclaimer & privacy policy at `/about` (Apple 1.4.1 / 5.1.1, Play Health policy). Use the published `/about` URL as the store privacy-policy URL.
- No runtime permissions requested; no tracking, ads or analytics. `ios/App/App/PrivacyInfo.xcprivacy` declares zero collection — add it to the Xcode App target ("Copy Bundle Resources") once.
- WebView debugging disabled in release; Android release build uses R8 shrinking with Capacitor keep rules.
- Splash screen always dismisses (3s failsafe) so the app can never hang at launch.
- Fonts and the whole food database are bundled — search works with no network, and no service worker runs inside the native shell.
- Bump `versionCode`/`versionName` in `android/app/build.gradle` and `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION` in Xcode for each store release.
