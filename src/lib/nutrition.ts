export interface Food {
  id: number;
  name: string;
  aliases: string[];
  category: string;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  calories: number;
  gi: number;
  gl: number;
  absorption: number;
  delayFactor: number;
  notes: string;
  recommendation: string;
}

export interface MealItem {
  key: string;
  id: number;
  name: string;
  grams: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  calories: number;
  gi: number;
  gl: number;
  absorption: number;
  delayFactor: number;
  notes: string;
  recommendation: string;
}

export function buildMealItem(food: Food, grams: number): MealItem {
  const factor = grams / 100;
  return {
    key: `${food.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: food.id,
    name: food.name,
    grams,
    carbs: food.carbs * factor,
    protein: food.protein * factor,
    fat: food.fat * factor,
    fiber: food.fiber * factor,
    calories: food.calories * factor,
    gi: food.gi,
    gl: food.gl * factor,
    absorption: food.absorption,
    delayFactor: food.delayFactor,
    notes: food.notes,
    recommendation: food.recommendation,
  };
}

export interface MealTotals {
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  calories: number;
  avgGI: number;
  totalGL: number;
  avgDelay: number;
}

/** Same math as the original web app (weighted GI by carbs, summed GL). */
export function calculateTotals(meal: MealItem[]): MealTotals {
  if (meal.length === 0) {
    return {
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
      calories: 0,
      avgGI: 0,
      totalGL: 0,
      avgDelay: 0,
    };
  }

  let carbs = 0;
  let protein = 0;
  let fat = 0;
  let fiber = 0;
  let calories = 0;
  let totalGL = 0;
  let weightedGI = 0;
  let carbWeight = 0;
  let delaySum = 0;

  for (const item of meal) {
    carbs += item.carbs;
    protein += item.protein;
    fat += item.fat;
    fiber += item.fiber;
    calories += item.calories;
    totalGL += item.gl;
    weightedGI += item.gi * item.carbs;
    carbWeight += item.carbs;
    delaySum += item.delayFactor;
  }

  return {
    carbs,
    protein,
    fat,
    fiber,
    calories,
    totalGL,
    avgGI: carbWeight === 0 ? 0 : weightedGI / carbWeight,
    avgDelay: delaySum / meal.length,
  };
}

export interface MealAnalysis {
  score: number;
  absorption: string;
  delay: string;
  level: string;
  advice: string;
  tone: "good" | "warn" | "high" | "danger";
}

/** Meal complexity analysis — identical formula to the original app. */
export function calculateMealScore(data: MealTotals): MealAnalysis {
  const glScore = Math.min(data.totalGL * 2, 100);
  const ratio = (data.fat + data.protein) / Math.max(data.carbs, 1);
  const ratioScore = Math.min(ratio * 100, 100);
  const delayScore = (data.avgDelay / 2) * 100;

  let absorption = "بطيء";
  if (data.avgGI >= 70) absorption = "سريع";
  else if (data.avgGI >= 56) absorption = "متوسط";

  const score = Math.round(glScore * 0.5 + ratioScore * 0.3 + delayScore * 0.2);

  let delay = "منخفض";
  if (data.avgDelay >= 1.5) delay = "مرتفع";
  else if (data.avgDelay >= 0.5) delay = "متوسط";

  let level: string;
  let advice: string;
  let tone: MealAnalysis["tone"];

  if (score <= 30) {
    level = "🟢 بسيطة";
    tone = "good";
    advice = "وجبة بسيطة غالبًا ولا تحتوي على عوامل كثيرة تؤخر امتصاص الكربوهيدرات.";
  } else if (score <= 60) {
    level = "🟡 متوسطة";
    tone = "warn";
    advice =
      "وجبة متوسطة التعقيد، يُنصح بمتابعة سكر الدم بعد الوجبة لأنها قد تختلف في تأثيرها بين الأشخاص.";
  } else if (score <= 80) {
    level = "🟠 مرتفعة";
    tone = "high";
    advice =
      "الوجبة تحتوي على عوامل قد تؤدي إلى ارتفاع ممتد في سكر الدم، لذا تستحق متابعة القراءات خلال الساعات التالية.";
  } else {
    level = "🔴 معقدة";
    tone = "danger";
    advice =
      "وجبة عالية التعقيد وقد يكون تأثيرها على سكر الدم ممتدًا بسبب مكوناتها. استخدم هذا التقييم كأداة تعليمية ولا تعتمد عليه وحده لاتخاذ قرارات جرعات الإنسولين.";
  }

  return { score, absorption, delay, level, advice, tone };
}

export function absorptionLabel(value: number): string {
  switch (value) {
    case 0:
      return "🚀 امتصاص سريع";
    case 1:
      return "⚡ امتصاص متوسط";
    case 2:
      return "🐢 امتصاص بطيء";
    default:
      return "غير محدد";
  }
}

export function delayLabel(value: number): string {
  switch (value) {
    case 0:
      return "🟢 تأخير منخفض";
    case 1:
      return "🟡 تأخير متوسط";
    case 2:
      return "🔴 تأخير مرتفع";
    default:
      return "غير محدد";
  }
}

export function giTone(gi: number): "good" | "warn" | "danger" {
  if (gi >= 70) return "danger";
  if (gi >= 56) return "warn";
  return "good";
}

/** Delayed-glucose guidance derived from the meal's delay factor + fat/protein load. */
export function delayedGlucoseAdvice(data: MealTotals, meal: MealItem[]): string {
  if (meal.length === 0) return "أضف بعض الأطعمة للحصول على توصيات التأخير.";
  const fatProtein = data.fat + data.protein;
  if (data.avgDelay >= 1.5 || fatProtein >= 40) {
    return "الوجبة تحتوي على دهون وبروتين مرتفعين مع عامل تأخير مرتفع: توقّع ارتفاعًا متأخرًا في السكر بعد ٣ إلى ٥ ساعات، وراقب القراءات على فترات.";
  }
  if (data.avgDelay >= 0.5 || fatProtein >= 20) {
    return "قد يظهر تأثير متأخر بسيط بعد ساعتين إلى ثلاث ساعات، يُنصح بقياس السكر بعد الوجبة بساعتين ثم بعد أربع ساعات.";
  }
  return "الامتصاص متوقع أن يكون سريعًا نسبيًا، والتأثير المتأخر محدود. قياس واحد بعد ساعتين كافٍ عادةً.";
}
