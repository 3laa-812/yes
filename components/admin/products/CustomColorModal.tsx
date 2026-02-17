"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCustomColor, type Color } from "@/lib/colors";
import { useLocale } from "next-intl";
import { toast } from "sonner";

interface CustomColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (color: Color) => void;
}

export function CustomColorModal({
  isOpen,
  onClose,
  onSave,
}: CustomColorModalProps) {
  const locale = useLocale();
  const [colorValue, setColorValue] = useState("#000000");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setColorValue("#000000");
      setNameEn("");
      setNameAr("");
    }
  }, [isOpen]);

  const handleSave = () => {
    // Validation
    if (!nameEn.trim()) {
      toast.error(locale === "ar" ? "يرجى إدخال الاسم بالإنجليزية" : "Please enter English name");
      return;
    }
    if (!nameAr.trim()) {
      toast.error(locale === "ar" ? "يرجى إدخال الاسم بالعربية" : "Please enter Arabic name");
      return;
    }
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
      toast.error(locale === "ar" ? "لون غير صالح" : "Invalid color format");
      return;
    }

    setIsSaving(true);
    try {
      const newColor = saveCustomColor({
        name_en: nameEn.trim(),
        name_ar: nameAr.trim(),
        value: colorValue.toUpperCase(),
      });
      
      onSave(newColor);
      toast.success(
        locale === "ar"
          ? "تم حفظ اللون بنجاح"
          : "Color saved successfully"
      );
      onClose();
    } catch (error) {
      console.error("Error saving color:", error);
      toast.error(
        locale === "ar"
          ? "فشل حفظ اللون"
          : "Failed to save color"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {locale === "ar" ? "إضافة لون مخصص" : "Add Custom Color"}
          </DialogTitle>
          <DialogDescription>
            {locale === "ar"
              ? "اختر لونًا وأضف اسمه بالإنجليزية والعربية"
              : "Choose a color and add its name in English and Arabic"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="color-picker">
              {locale === "ar" ? "اللون" : "Color"}
            </Label>
            <div className="flex items-center gap-4">
              <input
                id="color-picker"
                type="color"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                className="h-12 w-24 cursor-pointer rounded-md border-2 border-border bg-background"
              />
              <Input
                type="text"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono"
                maxLength={7}
              />
            </div>
            {/* Color Preview */}
            <div className="flex items-center gap-2 pt-2">
              <div
                className="w-16 h-16 rounded-lg border-2 border-border shadow-sm"
                style={{ backgroundColor: colorValue }}
              />
              <div className="text-sm text-muted-foreground">
                {locale === "ar" ? "معاينة" : "Preview"}
              </div>
            </div>
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <Label htmlFor="name-en">
              {locale === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}
            </Label>
            <Input
              id="name-en"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g., Midnight Blue"
              maxLength={50}
            />
          </div>

          {/* Arabic Name */}
          <div className="space-y-2">
            <Label htmlFor="name-ar">
              {locale === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}
            </Label>
            <Input
              id="name-ar"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: أزرق منتصف الليل"
              className="text-right"
              dir="rtl"
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            {locale === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !nameEn.trim() || !nameAr.trim()}
          >
            {isSaving
              ? locale === "ar"
                ? "جاري الحفظ..."
                : "Saving..."
              : locale === "ar"
                ? "حفظ"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
