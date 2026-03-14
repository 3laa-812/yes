"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleProductSoldOut } from "@/app/actions";
import { toast } from "sonner";
import { ShoppingBag, XCircle } from "lucide-react";

interface SoldOutButtonProps {
  id: string;
  isSoldOut: boolean;
  labelMarkSoldOut: string;
  labelMarkAvailable: string;
}

export function SoldOutButton({
  id,
  isSoldOut,
  labelMarkSoldOut,
  labelMarkAvailable,
}: SoldOutButtonProps) {
  const [pending, startTransition] = useTransition();
  const [optimisticSoldOut, setOptimisticSoldOut] = useState(isSoldOut);

  const handleToggle = () => {
    const next = !optimisticSoldOut;
    setOptimisticSoldOut(next);

    startTransition(async () => {
      const result = await toggleProductSoldOut(id, next);
      if (!result.success) {
        setOptimisticSoldOut(!next); // revert
        toast.error("Failed to update product status");
      } else {
        toast.success(
          next ? "Product marked as Sold Out" : "Product marked as Available",
        );
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={pending}
      className={
        optimisticSoldOut
          ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
      }
    >
      {optimisticSoldOut ? (
        <>
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          {labelMarkAvailable}
        </>
      ) : (
        <>
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          {labelMarkSoldOut}
        </>
      )}
    </Button>
  );
}
