import { memo } from "react";
import { Plus } from "lucide-react";

import { absorptionLabel, delayLabel, giTone } from "@/lib/nutrition";
import type { Food } from "@/lib/nutrition";

const toneClass = {
  good: "bg-success text-success-foreground",
  warn: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
} as const;

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-2 py-2 text-center">
      <small className="block text-[0.7rem] font-medium text-muted-foreground">{label}</small>
      <b className="mt-0.5 block text-base font-extrabold text-primary">{value}</b>
    </div>
  );
}

interface Props {
  food: Food;
  onAdd: (food: Food) => void;
  index?: number;
}

/** Memoized so typing in the search field only re-renders changed cards. */
export const FoodCard = memo(function FoodCard({ food, onAdd, index = 0 }: Props) {
  return (
    <article
      className="card-surface animate-rise p-4"
      style={{ animationDelay: `${Math.min(index, 6) * 35}ms` }}
    >
      <h3 className="text-lg leading-tight font-extrabold text-foreground">{food.name}</h3>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{food.category}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Info label="الكربوهيدرات" value={`${food.carbs} جم`} />
        <Info label="البروتين" value={`${food.protein} جم`} />
        <Info label="الدهون" value={`${food.fat} جم`} />
        <Info label="السعرات" value={`${food.calories}`} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        <li
          className={`rounded-full px-3 py-1 text-[0.72rem] font-bold ${toneClass[giTone(food.gi)]}`}
        >
          GI {food.gi}
        </li>
        <li className="rounded-full bg-primary px-3 py-1 text-[0.72rem] font-bold text-primary-foreground">
          GL {food.gl}
        </li>
        <li className="rounded-full bg-secondary px-3 py-1 text-[0.72rem] font-bold text-secondary-foreground">
          {absorptionLabel(food.absorption)}
        </li>
        <li className="rounded-full bg-secondary px-3 py-1 text-[0.72rem] font-bold text-secondary-foreground">
          {delayLabel(food.delayFactor)}
        </li>
      </ul>

      <button
        type="button"
        onClick={() => onAdd(food)}
        aria-label={`إضافة ${food.name} إلى الوجبة`}
        className="tap press mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-primary-foreground active:press-active"
      >
        <Plus aria-hidden="true" className="size-5" />
        إضافة للوجبة
      </button>
    </article>
  );
});
