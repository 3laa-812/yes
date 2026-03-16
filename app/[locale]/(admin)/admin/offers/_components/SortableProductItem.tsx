"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SortableProductItemProps {
  id: string;
  product: any;
  onRemove: (id: string) => void;
  locale: string;
}

export function SortableProductItem({ id, product, onRemove, locale }: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  let imageUrl = "/placeholder.png";
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0];
      }
    } catch (e) {
      // ignore
    }
  }

  const name = locale === "ar" ? product.name_ar : product.name_en;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm ${
        isDragging ? "border-primary" : ""
      }`}
    >
      <button
        type="button"
        className="touch-none rounded-md p-1 hover:bg-muted text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium line-clamp-1">{name}</span>
        <span className="text-xs text-muted-foreground">{product.price} EGP</span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        onClick={() => onRemove(id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
