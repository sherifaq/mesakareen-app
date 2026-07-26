import { useEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import type { Food } from "@/lib/nutrition";
import { haptic, hideKeyboard } from "@/lib/native";

const PRESETS = [50, 100, 150, 200];

interface Props {
  food: Food | null;
  onClose: () => void;
  onConfirm: (grams: number) => void;
}

/** Native-feeling bottom sheet for entering the portion weight in grams. */
export function QuantitySheet({ food, onClose, onConfirm }: Props) {
  const [value, setValue] = useState("100");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (food) setValue("100");
  }, [food]);

  useEffect(() => {
    if (!food) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [food, onClose]);

  if (!food) return null;

  const grams = Number.parseFloat(value);
  const valid = Number.isFinite(grams) && grams > 0;

  const step = (delta: number) => {
    void haptic("light");
    const next = Math.max(5, (valid ? grams : 100) + delta);
    setValue(String(Math.round(next)));
  };

  const submit = () => {
    if (!valid) return;
    void hideKeyboard();
    onConfirm(Math.round(grams));
  };

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-end bg-foreground/45"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="animate-sheet max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl bg-card p-5"
        style={{
          paddingBottom:
            "calc(var(--safe-bottom) + var(--keyboard-height, 0px) + 1.25rem)",
          paddingInlineStart: "max(1.25rem, var(--safe-left))",
          paddingInlineEnd: "max(1.25rem, var(--safe-right))",
        }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="sheet-title" className="truncate text-lg font-extrabold text-foreground">
              {food.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">أدخل الوزن بالجرام</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="tap press grid shrink-0 place-items-center rounded-full bg-muted text-muted-foreground active:press-active"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => step(-10)}
            aria-label="إنقاص الوزن"
            className="tap press grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground active:press-active"
          >
            <Minus aria-hidden="true" className="size-5" />
          </button>
          <label className="flex-1">
            <span className="sr-only">الوزن بالجرام</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              enterKeyHint="done"
              value={value}
              autoFocus
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              className="w-full rounded-2xl border border-input bg-surface py-3.5 text-center text-2xl font-extrabold text-foreground"
            />
          </label>
          <button
            type="button"
            onClick={() => step(10)}
            aria-label="زيادة الوزن"
            className="tap press grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground active:press-active"
          >
            <Plus aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                void haptic("light");
                setValue(String(preset));
              }}
              className="tap press rounded-xl bg-primary-soft py-2 text-sm font-bold text-primary active:press-active"
            >
              {preset} جم
            </button>
          ))}
        </div>

        {!valid && (
          <p role="alert" className="mt-3 text-sm font-bold text-destructive">
            أدخل وزنًا صحيحًا أكبر من صفر.
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className="tap press flex-1 rounded-2xl bg-success py-4 text-base font-bold text-success-foreground active:press-active disabled:opacity-50"
          >
            إضافة
          </button>
          <button
            type="button"
            onClick={onClose}
            className="tap press flex-1 rounded-2xl bg-secondary py-4 text-base font-bold text-secondary-foreground active:press-active"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
