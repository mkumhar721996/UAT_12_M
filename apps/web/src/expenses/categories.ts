export const CATEGORIES = ["Travel", "Meals", "Office", "Other"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_HINTS: Record<Category, string> = {
  Travel: "Flights, taxis, hotels",
  Meals: "Client lunches, team dinners",
  Office: "Supplies, software, equipment",
  Other: "Anything that fits nowhere else",
};
