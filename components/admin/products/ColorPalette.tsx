"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAllColors,
  getCustomColors,
  type Color,
} from "@/lib/colors";
import { CustomColorModal } from "./CustomColorModal";
import { useLocale } from "next-intl";

interface ColorPaletteProps {
  selectedColors: string[];
  onSelectionChange: (colors: string[]) => void;
  maxSelection?: number;
}

export function ColorPalette({
  selectedColors,
  onSelectionChange,
  maxSelection,
}: ColorPaletteProps) {
  const locale = useLocale();
  const [colors, setColors] = useState<Color[]>(getAllColors());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredColorId, setHoveredColorId] = useState<string | null>(null);

  // Refresh colors when custom colors change
  useEffect(() => {
    const handleStorageChange = () => {
      setColors(getAllColors());
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom color saves in same window
    window.addEventListener("customColorSaved", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("customColorSaved", handleStorageChange);
    };
  }, []);

  const handleColorToggle = (color: Color) => {
    const colorKey = color.name_en; // Use English name as key for compatibility
    
    if (selectedColors.includes(colorKey)) {
      onSelectionChange(selectedColors.filter((c) => c !== colorKey));
    } else {
      if (maxSelection && selectedColors.length >= maxSelection) {
        return; // Don't add if max reached
      }
      onSelectionChange([...selectedColors, colorKey]);
    }
  };

  const handleCustomColorSaved = (newColor: Color) => {
    setColors(getAllColors());
    // Dispatch event for other components
    window.dispatchEvent(new Event("customColorSaved"));
  };

  // Separate predefined and custom colors
  const { predefinedColors, customColors } = useMemo(() => {
    const predefined = colors.filter((c) => !c.isCustom);
    const custom = colors.filter((c) => c.isCustom);
    return { predefinedColors: predefined, customColors: custom };
  }, [colors]);

  const isSelected = (color: Color) => selectedColors.includes(color.name_en);

  return (
    <div className="space-y-4">
      {/* Predefined Colors */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {locale === "ar" ? "الألوان الأساسية" : "Predefined Colors"}
        </label>
        <div className="flex flex-wrap gap-2">
          {predefinedColors.map((color) => {
            const selected = isSelected(color);
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => handleColorToggle(color)}
                onMouseEnter={() => setHoveredColorId(color.id)}
                onMouseLeave={() => setHoveredColorId(null)}
                className={cn(
                  "relative group cursor-pointer rounded-lg border-2 p-1 w-12 h-12 flex items-center justify-center transition-all duration-200",
                  selected
                    ? "border-primary scale-110 shadow-lg ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:scale-105",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                title={`${color.name_en} / ${color.name_ar}`}
                aria-label={`${color.name_en} / ${color.name_ar}`}
              >
                <div
                  className="w-full h-full rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
                  style={{ backgroundColor: color.value }}
                />
                {selected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                      ✓
                    </div>
                  </div>
                )}
                {/* Tooltip on hover */}
                {hoveredColorId === color.id && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none">
                    {locale === "ar" ? color.name_ar : color.name_en}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      {customColors.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {locale === "ar" ? "ألوان مخصصة" : "Custom Colors"}
          </label>
          <div className="flex flex-wrap gap-2">
            {customColors.map((color) => {
              const selected = isSelected(color);
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleColorToggle(color)}
                  onMouseEnter={() => setHoveredColorId(color.id)}
                  onMouseLeave={() => setHoveredColorId(null)}
                  className={cn(
                    "relative group cursor-pointer rounded-lg border-2 p-1 w-12 h-12 flex items-center justify-center transition-all duration-200",
                    selected
                      ? "border-primary scale-110 shadow-lg ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:scale-105",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                  title={`${color.name_en} / ${color.name_ar}`}
                  aria-label={`${color.name_en} / ${color.name_ar}`}
                >
                  <div
                    className="w-full h-full rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  {selected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                        ✓
                      </div>
                    </div>
                  )}
                  {/* Tooltip */}
                  {hoveredColorId === color.id && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none">
                      {locale === "ar" ? color.name_ar : color.name_en}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Color Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        {locale === "ar" ? "إضافة لون مخصص" : "Add Custom Color"}
      </Button>

      {/* Selected Colors Summary */}
      {selectedColors.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            {locale === "ar"
              ? `${selectedColors.length} لون محدد`
              : `${selectedColors.length} color${selectedColors.length > 1 ? "s" : ""} selected`}
          </p>
        </div>
      )}

      <CustomColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCustomColorSaved}
      />
    </div>
  );
}
