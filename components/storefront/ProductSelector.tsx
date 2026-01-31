"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";

interface ProductSelectorProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
}

export function ProductSelector({
  id,
  name,
  price,
  image,
  category,
  sizes,
  colors,
}: ProductSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color");
      return;
    }

    addItem({
      id: `${id}-${selectedSize}-${selectedColor}`,
      productId: id,
      name,
      price,
      image,
      category,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });

    toast.success("Added to cart");
  };

  return (
    <div className="mt-10">
      {/* Colors */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Color</h3>
        <div className="mt-4 flex items-center space-x-3">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "relative -m-0.5 flex cursor-pointer item-center justify-center rounded-full p-0.5 focus:outline-none ring-gray-400",
                selectedColor === color ? "ring ring-offset-1" : "",
              )}
            >
              <span
                aria-hidden="true"
                className="h-8 w-8 rounded-full border border-black border-opacity-10"
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Size</h3>
          <a
            href="#"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Size Guide
          </a>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6",
                selectedSize === size
                  ? "bg-indigo-600 text-white shadow-sm border-transparent hover:bg-indigo-700"
                  : "bg-white text-gray-900 shadow-sm border-gray-200",
              )}
            >
              <span>{size}</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        size="lg"
        className="w-full mt-10 rounded-full h-14 text-base font-semibold"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  );
}
