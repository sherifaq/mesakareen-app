import { Loader2, SearchX, WifiOff, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label = "جارٍ التحميل..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
    >
      <Loader2 aria-hidden="true" className="size-8 animate-spin text-primary" />
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card-surface h-40 animate-pulse bg-muted" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="animate-rise flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-primary-soft text-primary">
        {icon ?? <SearchX aria-hidden="true" className="size-9" />}
      </div>
      <h3 className="text-lg font-extrabold text-foreground">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({
  title = "حدث خطأ",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="animate-rise flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div className="grid size-20 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle aria-hidden="true" className="size-9" />
      </div>
      <h3 className="text-lg font-extrabold text-foreground">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="tap press mt-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground active:press-active"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div
      role="status"
      className="animate-fade flex items-center justify-center gap-2 bg-warning px-4 py-2 text-xs font-bold text-warning-foreground"
    >
      <WifiOff aria-hidden="true" className="size-4" />
      أنت غير متصل بالإنترنت — التطبيق يعمل بالبيانات المحفوظة
    </div>
  );
}
