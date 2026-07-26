import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { Info, Search, UtensilsCrossed, X } from "lucide-react";

import { FoodCard } from "@/components/FoodCard";
import { QuantitySheet } from "@/components/QuantitySheet";
import { EmptyState, ErrorState, SkeletonCards } from "@/components/States";
import { foodsQueryOptions, MAX_RESULTS, searchFoods } from "@/lib/foods";
import { useMeal } from "@/lib/meal-context";
import { haptic, hideKeyboard } from "@/lib/native";
import type { Food } from "@/lib/nutrition";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مسكرين | بحث الأطعمة لمرضى السكري" },
      {
        name: "description",
        content:
          "ابحث عن أي طعام واعرف الكربوهيدرات والبروتين والدهون والسعرات والمؤشر الجلايسيمي فورًا.",
      },
      { property: "og:title", content: "مسكرين | بحث الأطعمة لمرضى السكري" },
      {
        property: "og:description",
        content: "بحث فوري في أكثر من ٣٣٠٠ طعام مع القيم الغذائية والمؤشر الجلايسيمي.",
      },
    ],
  }),
  component: SearchScreen,
});

function SearchScreen() {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Food | null>(null);
  const navigate = useNavigate();
  const { addFood, meal } = useMeal();

  // Deferred value keeps typing smooth while the list re-filters.
  const deferredKeyword = useDeferredValue(keyword);
  const typing = keyword.trim() !== "";

  const { data, isLoading, isError, refetch } = useQuery({
    ...foodsQueryOptions,
    enabled: typing,
  });

  const results = useMemo(
    () => (data ? searchFoods(data, deferredKeyword) : []),
    [data, deferredKeyword],
  );

  return (
    <main
      className="safe-x mx-auto max-w-md scroll-native"
      style={{
        paddingTop: "calc(var(--safe-top) + 1rem)",
        paddingBottom: "calc(var(--tabbar-height) + var(--safe-bottom) + 1.5rem)",
      }}
    >
      <header className="card-surface p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <h1 className="text-2xl leading-tight font-extrabold text-primary">
            دليل التغذية لمرضى السكري
          </h1>
          <Link
            to="/about"
            aria-label="عن التطبيق والخصوصية"
            className="tap press grid shrink-0 place-items-center rounded-xl bg-primary-soft text-primary active:press-active"
          >
            <Info aria-hidden="true" className="size-5" />
          </Link>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ابحث عن أي طعام، أضفه إلى الوجبة، واحصل على تحليل غذائي ومؤشر تعقيد الوجبة.
        </p>

        <div className="relative mt-4">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 start-4 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <label>
            <span className="sr-only">ابحث عن طعام</span>
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void hideKeyboard();
              }}
              enterKeyHint="search"
              autoComplete="off"
              placeholder="اكتب اسم الطعام..."
              className="w-full rounded-2xl border border-input bg-surface py-4 ps-12 pe-12 text-base font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground"
            />
          </label>
          {typing && (
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                void haptic("light");
              }}
              aria-label="مسح البحث"
              className="tap press absolute top-1/2 end-2 grid -translate-y-1/2 place-items-center rounded-full text-muted-foreground active:press-active"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
      </header>

      <section aria-label="نتائج البحث" className="mt-5">
        {!typing ? (
          <EmptyState
            title="ابدأ بالكتابة للبحث"
            description="اكتب اسم الطعام في الأعلى وستظهر لك أول ٦ نتائج مطابقة مباشرة."
            icon={<Search aria-hidden="true" className="size-9" />}
          />
        ) : isLoading ? (
          <SkeletonCards count={3} />
        ) : isError ? (
          <ErrorState
            description="تعذر تحميل قاعدة بيانات الأطعمة. تحقق من الاتصال وحاول مرة أخرى."
            onRetry={() => void refetch()}
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="لا توجد نتائج"
            description="لم نجد طعامًا مطابقًا. جرّب اسمًا آخر أو كلمة أقصر."
          />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-foreground">نتائج البحث</h2>
              <span className="text-xs font-bold text-muted-foreground">
                أول {Math.min(results.length, MAX_RESULTS)} نتائج
              </span>
            </div>
            <div className="space-y-3">
              {results.map((food, index) => (
                <FoodCard key={food.id} food={food} index={index} onAdd={setSelected} />
              ))}
            </div>
          </>
        )}
      </section>

      {meal.length > 0 && (
        <button
          type="button"
          onClick={() => {
            void haptic("light");
            void navigate({ to: "/meal" });
          }}
          className="tap press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-4 text-base font-bold text-success-foreground active:press-active"
        >
          <UtensilsCrossed aria-hidden="true" className="size-5" />
          عرض الوجبة ({meal.length})
        </button>
      )}

      <p className="mt-5 text-center text-[0.72rem] leading-relaxed text-muted-foreground">
        القيم تقديرية لأغراض تعليمية فقط ولا تُستخدم لتحديد جرعات الإنسولين.{" "}
        <Link to="/about" className="font-bold text-primary underline">
          اعرف المزيد
        </Link>
      </p>

      <QuantitySheet
        food={selected}
        onClose={() => setSelected(null)}
        onConfirm={(grams) => {
          if (selected) addFood(selected, grams);
          setSelected(null);
        }}
      />
    </main>
  );
}
