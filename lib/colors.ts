/**
 * Color Management System
 * Handles predefined colors, custom colors, and localStorage persistence
 */

export interface Color {
  id: string;
  name_en: string;
  name_ar: string;
  value: string; // Hex color code
  isCustom?: boolean;
}

// Default predefined colors (fashion-focused palette)
export const DEFAULT_COLORS: Color[] = [
  { id: "black", name_en: "Black", name_ar: "أسود", value: "#000000" },
  { id: "white", name_en: "White", name_ar: "أبيض", value: "#FFFFFF" },
  { id: "navy", name_en: "Navy", name_ar: "كحلي", value: "#000080" },
  { id: "gray", name_en: "Gray", name_ar: "رمادي", value: "#808080" },
  { id: "beige", name_en: "Beige", name_ar: "بيج", value: "#F5F5DC" },
  { id: "red", name_en: "Red", name_ar: "أحمر", value: "#FF0000" },
  { id: "burgundy", name_en: "Burgundy", name_ar: "بورجوندي", value: "#800020" },
  { id: "blue", name_en: "Blue", name_ar: "أزرق", value: "#0000FF" },
  { id: "light-blue", name_en: "Light Blue", name_ar: "أزرق فاتح", value: "#ADD8E6" },
  { id: "green", name_en: "Green", name_ar: "أخضر", value: "#008000" },
  { id: "olive", name_en: "Olive", name_ar: "زيتوني", value: "#808000" },
  { id: "yellow", name_en: "Yellow", name_ar: "أصفر", value: "#FFFF00" },
  { id: "orange", name_en: "Orange", name_ar: "برتقالي", value: "#FFA500" },
  { id: "pink", name_en: "Pink", name_ar: "وردي", value: "#FFC0CB" },
  { id: "purple", name_en: "Purple", name_ar: "بنفسجي", value: "#800080" },
  { id: "brown", name_en: "Brown", name_ar: "بني", value: "#A52A2A" },
  { id: "khaki", name_en: "Khaki", name_ar: "كاكي", value: "#C3B091" },
  { id: "coral", name_en: "Coral", name_ar: "مرجاني", value: "#FF7F50" },
  { id: "mint", name_en: "Mint", name_ar: "نعناعي", value: "#98FF98" },
  { id: "lavender", name_en: "Lavender", name_ar: "لافندر", value: "#E6E6FA" },
];

const STORAGE_KEY = "custom-colors";

/**
 * Get all colors (predefined + custom)
 */
export function getAllColors(): Color[] {
  const customColors = getCustomColors();
  return [...DEFAULT_COLORS, ...customColors];
}

/**
 * Get custom colors from localStorage
 */
export function getCustomColors(): Color[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Color[];
  } catch {
    return [];
  }
}

/**
 * Save a custom color
 */
export function saveCustomColor(color: Omit<Color, "id" | "isCustom">): Color {
  const customColors = getCustomColors();
  const newColor: Color = {
    ...color,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    isCustom: true,
  };
  
  const updated = [...customColors, newColor];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newColor;
}

/**
 * Delete a custom color
 */
export function deleteCustomColor(colorId: string): void {
  const customColors = getCustomColors();
  const updated = customColors.filter((c) => c.id !== colorId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Find color by name (for backward compatibility with old string-based colors)
 */
export function findColorByName(name: string): Color | undefined {
  const allColors = getAllColors();
  return allColors.find(
    (c) => c.name_en.toLowerCase() === name.toLowerCase() ||
           c.name_ar === name ||
           c.value.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get color display name (for variants table)
 */
export function getColorDisplayName(color: string | Color, locale: "en" | "ar" = "en"): string {
  if (typeof color === "string") {
    const found = findColorByName(color);
    if (found) {
      return locale === "ar" ? found.name_ar : found.name_en;
    }
    return color; // Fallback to original string
  }
  return locale === "ar" ? color.name_ar : color.name_en;
}

/**
 * Get color value (hex) from color string or Color object
 */
export function getColorValue(color: string | Color): string {
  if (typeof color === "string") {
    const found = findColorByName(color);
    return found?.value || color; // If it's already a hex, return it
  }
  return color.value;
}
