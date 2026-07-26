import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { buildMealItem, calculateMealScore, calculateTotals } from "./nutrition";
import type { Food, MealAnalysis, MealItem, MealTotals } from "./nutrition";
import { haptic } from "./native";

const STORAGE_KEY = "mesakareen.meal.v1";

interface MealContextValue {
  meal: MealItem[];
  totals: MealTotals;
  analysis: MealAnalysis;
  addFood: (food: Food, grams: number) => void;
  removeItem: (key: string) => void;
  clearMeal: () => void;
}

const MealContext = createContext<MealContextValue | null>(null);

export function MealProvider({ children }: { children: React.ReactNode }) {
  const [meal, setMeal] = useState<MealItem[]>([]);

  // Read persisted meal after hydration so SSR and client markup match.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setMeal(JSON.parse(raw) as MealItem[]);
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meal));
    } catch {
      /* storage full or unavailable */
    }
  }, [meal]);

  const addFood = useCallback((food: Food, grams: number) => {
    setMeal((current) => [...current, buildMealItem(food, grams)]);
    void haptic("success");
  }, []);

  const removeItem = useCallback((key: string) => {
    setMeal((current) => current.filter((item) => item.key !== key));
    void haptic("medium");
  }, []);

  const clearMeal = useCallback(() => {
    setMeal([]);
    void haptic("warning");
  }, []);

  const totals = useMemo(() => calculateTotals(meal), [meal]);
  const analysis = useMemo(() => calculateMealScore(totals), [totals]);

  const value = useMemo(
    () => ({ meal, totals, analysis, addFood, removeItem, clearMeal }),
    [meal, totals, analysis, addFood, removeItem, clearMeal],
  );

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
}

export function useMeal(): MealContextValue {
  const context = useContext(MealContext);
  if (!context) throw new Error("useMeal must be used inside MealProvider");
  return context;
}
