import { queryOptions } from "@tanstack/react-query";

import type { Food } from "./nutrition";

/**
 * The food database is a large static JSON file served from /data/foods.json.
 * It is fetched lazily, cached forever by react-query, and pre-warmed while the
 * device is idle so the very first keystroke already has data in memory.
 */
async function fetchFoods(): Promise<Food[]> {
  const response = await fetch("./data/foods.json", {
  cache: "force-cache",
});
  if (!response.ok) {
    throw new Error("تعذر تحميل قاعدة بيانات الأطعمة");
  }
  const foods = (await response.json()) as Food[];
  buildIndex(foods);
  return foods;
}

export const foodsQueryOptions = queryOptions({
  queryKey: ["foods"],
  queryFn: fetchFoods,
  staleTime: Infinity,
  gcTime: Infinity,
  retry: 1,
});

export const MAX_RESULTS = 6;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

export const normalizeQuery = normalize;

/**
 * Normalising ~3.4k names + aliases on every keystroke was the main jank
 * source. The haystack is normalised once per dataset and reused after that.
 */
const indexCache = new WeakMap<Food[], string[]>();

function buildIndex(foods: Food[]): string[] {
  const cached = indexCache.get(foods);
  if (cached) return cached;
  const index = foods.map((food) =>
    normalize(food.aliases.length ? `${food.name} ${food.aliases.join(" ")}` : food.name),
  );
  indexCache.set(foods, index);
  return index;
}

/** Filters foods by name/alias and returns only the first six matches. */
export function searchFoods(foods: Food[], keyword: string): Food[] {
  const query = normalize(keyword);
  if (query === "") return [];

  const index = buildIndex(foods);
  const matches: Food[] = [];
  for (let i = 0; i < index.length; i += 1) {
    if (index[i].includes(query)) {
      matches.push(foods[i]);
      if (matches.length === MAX_RESULTS) break;
    }
  }
  return matches;
}
