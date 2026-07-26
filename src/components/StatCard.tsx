const toneClass = {
  neutral: "text-primary",
  good: "text-success",
  warn: "text-warning",
  high: "text-high",
  danger: "text-destructive",
} as const;

export function StatCard({
  label,
  value,
  unit,
  tone = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: keyof typeof toneClass;
}) {
  return (
    <div className="rounded-2xl border border-accent bg-surface p-3 text-center">
      <h3 className="text-xs font-bold text-muted-foreground">{label}</h3>
      <p className={`mt-1.5 text-xl font-extrabold ${toneClass[tone]}`}>
        {value}
        {unit && <span className="ms-1 text-xs font-bold text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}
