import { Link, useRouterState } from "@tanstack/react-router";
import { Search, UtensilsCrossed } from "lucide-react";

import { useMeal } from "@/lib/meal-context";
import { haptic } from "@/lib/native";

const tabs = [
  { to: "/", label: "البحث", icon: Search },
  { to: "/meal", label: "الوجبة", icon: UtensilsCrossed },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { meal } = useMeal();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg"
      style={{
        paddingBottom: "var(--safe-bottom)",
        boxShadow: "var(--shadow-nav)",
      }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-2">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                onClick={() => void haptic("light")}
                aria-current={active ? "page" : undefined}
                className="press flex h-[4.25rem] flex-col items-center justify-center gap-1 text-muted-foreground active:press-active aria-[current=page]:text-primary"
              >
                <span className="relative">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={active ? 2.6 : 2} />
                  {to === "/meal" && meal.length > 0 && (
                    <span className="absolute -end-2.5 -top-2 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.7rem] font-bold text-primary-foreground">
                      {meal.length}
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
