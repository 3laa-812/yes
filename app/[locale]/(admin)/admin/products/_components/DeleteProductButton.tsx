"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/app/actions";
import { toast } from "sonner";
import { useTransition } from "react";

export function DeleteProductButton({
  id,
  label = "Delete",
}: {
  id: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("productId", id);
        try {
          const result = await deleteProduct(formData);
          if (result.success) {
            toast.success("Product deleted successfully");
          } else {
            toast.error(result.error || "Failed to delete product");
          }
        } catch (error) {
          toast.error("Something went wrong");
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      {label}
    </Button>
  );
}
