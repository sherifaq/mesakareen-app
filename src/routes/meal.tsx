import { createFileRoute, Link } from "@tanstack/react-router";
import { Share2, Trash2, UtensilsCrossed } from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/States";
import { useMeal } from "@/lib/meal-context";
import { haptic, shareText } from "@/lib/native";
import { absorptionLabel, delayLabel, delayedGlucoseAdvice } from "@/lib/nutrition";

export const Route = createFileRoute("/meal")({
  head: () => ({
    meta: [
      { title: "مسكرين | حاسبة الوجبة وتحليل السكر" },
      {
        name: "description",
        content:
          "احسب إجمالي الكربوهيدرات والبروتين والدهون والسعرات مع الحمل الجلايسيمي وتعقيد الوجبة وتوصيات التأخير.",
      },
      { property: "og:title", content: "مسكرين | حاسبة الوجبة وتحليل السكر" },
      {
        property: "og:description",
        content: "تحليل كامل للوجبة: GL، تعقيد الوجبة، سرعة الامتصاص وعامل التأخير.",
      },
    ],
  }),
  component: MealScreen,
});

const toneMap = {
  good: "good",
  warn: "warn",
  high: "high",
  danger: "danger",
} as const;

function MealScreen() {
  const { meal, totals, analysis, removeItem, clearMeal } = useMeal();

  const share = () => {
    const lines = meal.map(
      (item) => `• ${item.name} — ${item.grams.toFixed(0)} جم (كارب ${item.carbs.toFixed(1)})`,
    );
    void shareText(
      "وجبتي في مسكرين",
      [
        "وجبتي في تطبيق مسكرين:",
        ...lines,
        "",
        `الكربوهيدرات: ${totals.carbs.toFixed(1)} جم`,
        `البروتين: ${totals.protein.toFixed(1)} جم`,
        `الدهون: ${totals.fat.toFixed(1)} جم`,
        `السعرات: ${totals.calories.toFixed(0)}`,
        `متوسط GI: ${totals.avgGI.toFixed(0)} — GL: ${totals.totalGL.toFixed(1)}`,
        `تعقيد الوجبة: ${analysis.score} (${analysis.level})`,
      ].join("\n"),
    );
  };

  return (
    <main
      className="safe-x mx-auto max-w-md scroll-native"
      style={{
        paddingTop: "calc(var(--safe-top) + 1rem)",
        paddingBottom: "calc(var(--tabbar-height) + var(--safe-bottom) + 1.5rem)",
      }}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate text-2xl font-extrabold text-primary">الوجبة الحالية</h1>
        {meal.length > 0 && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={share}
              aria-label="مشاركة الوجبة"
              className="tap press grid place-items-center rounded-xl bg-card text-primary active:press-active"
            >
              <Share2 aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={clearMeal}
              aria-label="حذف كل العناصر"
              className="tap press grid place-items-center rounded-xl bg-card text-destructive active:press-active"
            >
              <Trash2 aria-hidden="true" className="size-5" />
            </button>
          </div>
        )}
      </header>

      {meal.length === 0 ? (
        <>
          <EmptyState
            title="لم تتم إضافة أي طعام"
            description="ابحث عن الأطعمة وأضفها إلى وجبتك لتحصل على التحليل الغذائي الكامل."
            icon={<UtensilsCrossed aria-hidden="true" className="size-9" />}
          />
          <Link
            to="/"
            onClick={() => void haptic("light")}
            className="tap press flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground active:press-active"
          >
            ابحث عن طعام
          </Link>
        </>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {meal.map((item) => (
              <li key={item.key} className="card-surface animate-rise p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-extrabold text-foreground">
                      {item.name}
                    </h2>
                    <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                      {item.grams.toFixed(0)} جم · {item.calories.toFixed(0)} سعرة
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`حذف ${item.name} من الوجبة`}
                    className="tap press grid shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive active:press-active"
                  >
                    <Trash2 aria-hidden="true" className="size-5" />
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    ["كارب", `${item.carbs.toFixed(1)}`],
                    ["بروتين", `${item.protein.toFixed(1)}`],
                    ["دهون", `${item.fat.toFixed(1)}`],
                    ["GL", `${item.gl.toFixed(1)}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-muted px-1 py-2">
                      <dt className="text-[0.7rem] font-medium text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 text-sm font-extrabold text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[0.72rem] font-bold text-muted-foreground">
                  {absorptionLabel(item.absorption)} · {delayLabel(item.delayFactor)}
                </p>
              </li>
            ))}
          </ul>

          <section aria-label="ملخص الوجبة" className="mt-6">
            <h2 className="mb-3 text-base font-extrabold text-foreground">ملخص الوجبة</h2>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="إجمالي الكربوهيدرات" value={totals.carbs.toFixed(1)} unit="جم" />
              <StatCard label="إجمالي البروتين" value={totals.protein.toFixed(1)} unit="جم" />
              <StatCard label="إجمالي الدهون" value={totals.fat.toFixed(1)} unit="جم" />
              <StatCard label="الألياف" value={totals.fiber.toFixed(1)} unit="جم" />
              <StatCard label="السعرات" value={totals.calories.toFixed(0)} />
              <StatCard label="متوسط GI" value={totals.avgGI.toFixed(0)} />
            </div>
          </section>

          <section
            aria-label="تحليل الوجبة"
            className="mt-6 rounded-3xl border border-accent bg-primary-soft p-4"
          >
            <h2 className="mb-3 text-base font-extrabold text-primary">تحليل الوجبة</h2>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="الحمل الجلايسيمي GL" value={totals.totalGL.toFixed(1)} />
              <StatCard
                label="تعقيد الوجبة"
                value={String(analysis.score)}
                tone={toneMap[analysis.tone]}
              />
              <StatCard label="سرعة الامتصاص" value={analysis.absorption} />
              <StatCard label="عامل التأخير" value={analysis.delay} />
            </div>

            <div className="mt-3 rounded-2xl bg-card p-4">
              <p className="text-sm font-extrabold text-foreground">التقييم: {analysis.level}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {analysis.advice}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-card p-4">
              <h3 className="text-sm font-extrabold text-foreground">⏱️ الارتفاع المتأخر للسكر</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {delayedGlucoseAdvice(totals, meal)}
              </p>
            </div>

            <p className="mt-3 text-[0.72rem] leading-relaxed text-muted-foreground">
              هذه الحسابات أداة تعليمية ولا تُستخدم وحدها لاتخاذ قرارات جرعات الإنسولين.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
