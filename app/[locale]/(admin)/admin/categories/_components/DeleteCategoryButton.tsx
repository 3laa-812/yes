"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/actions";
import { toast } from "sonner";
import { useTransition } from "react";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this category?")) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("id", id);
        try {
          const result = await deleteCategory(formData);
          if (result.success) {
            toast.success("Category deleted");
          } else {
            toast.error(result.error || "Failed to delete category");
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
      size="icon"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
