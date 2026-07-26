import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MealProvider } from "../lib/meal-context";
import { initNative, registerAppLifecycle, hideSplash } from "../lib/native";
import { foodsQueryOptions } from "../lib/foods";
import { registerServiceWorker } from "../lib/pwa";
import { BottomNav } from "../components/BottomNav";
import { InstallPrompt } from "../components/InstallPrompt";
import { OfflineBanner } from "../components/States";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-bold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متاحة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="tap press inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground active:press-active"
          >
            العودة للبحث
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold text-foreground">تعذر تحميل هذه الصفحة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حدث خطأ غير متوقع. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="tap press rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground active:press-active"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="tap press rounded-xl border border-input bg-card px-5 py-3 text-sm font-bold text-foreground active:press-active"
          >
            الصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes",
      },
      { title: "مسكرين | دليل التغذية لمرضى السكري" },
      {
        name: "description",
        content:
          "ابحث عن أي طعام، أضفه إلى وجبتك، واحصل على تحليل غذائي كامل مع المؤشر الجلايسيمي وتعقيد الوجبة.",
      },
      { name: "theme-color", content: "#1565c0" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "مسكرين" },
      { name: "format-detection", content: "telephone=no" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      // Fonts are bundled locally (@fontsource/tajawal) so text renders
      // instantly and identically offline inside the native shell.
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", type: "image/png", href: "/icons/icon-192.png" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    registerServiceWorker();
    let dispose: (() => void) | undefined;

    void initNative(setOnline).then((info) => setOnline(info.online));
    // Failsafe: never leave the user staring at the splash screen.
    const splashFailsafe = window.setTimeout(() => void hideSplash(), 3000);

    // Warm the food database while the device is idle so the first keystroke
    // renders results immediately.
    const idle = (
      window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 1200))
    )(() => void queryClient.prefetchQuery(foodsQueryOptions));

    void registerAppLifecycle({
      onResume: () => {
        if (typeof navigator !== "undefined") setOnline(navigator.onLine);
      },
    }).then((cleanup) => {
      dispose = cleanup;
    });

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.clearTimeout(splashFailsafe);
      window.cancelIdleCallback?.(idle as number);
      dispose?.();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <MealProvider>
        <div className="min-h-dvh bg-background">
          {!online && (
            <div className="fixed inset-x-0 top-0 z-50" style={{ paddingTop: "var(--safe-top)" }}>
              <OfflineBanner />
            </div>
          )}
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <InstallPrompt />
          <BottomNav />
        </div>
      </MealProvider>
    </QueryClientProvider>
  );
}
