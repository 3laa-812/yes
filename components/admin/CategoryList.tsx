"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, GripVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DeleteCategoryButton } from "@/app/[locale]/(admin)/admin/categories/_components/DeleteCategoryButton"; // Adjust path if needed
import { updateCategoryOrder } from "@/app/actions"; // We need to create this action
import { toast } from "sonner";

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  image: string | null;
  displayOrder: number;
  children: Category[];
  _count: {
    products: number;
  };
}

interface CategoryListProps {
  initialCategories: Category[];
}

// Sortable Row Component
function SortableCategoryRow({
  category,
  level = 0,
}: {
  category: Category;
  level?: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={level === 0 ? "bg-muted/30 font-medium" : "hover:bg-muted/10"}
    >
      <TableCell className="w-[50px]">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-primary"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className={level > 0 ? "pl-10" : ""}>
        <div className="flex items-center">
          {level > 0 && (
            <span className="border-l-2 border-b-2 w-3 h-3 mr-2 border-muted-foreground/30"></span>
          )}
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name_en}
              width={level === 0 ? 40 : 30}
              height={level === 0 ? 40 : 30}
              className="rounded-md object-cover aspect-square"
            />
          ) : (
            <div
              className={`rounded-md bg-muted flex items-center justify-center text-[10px] ${level === 0 ? "w-10 h-10" : "w-8 h-8"}`}
            >
              No
            </div>
          )}
        </div>
      </TableCell>
      <TableCell
        className={
          level === 0 ? "font-bold text-base" : "text-muted-foreground"
        }
      >
        {category.name_en}
        {level === 0 && (
          <span className="text-muted-foreground font-normal ml-2 text-xs">
            ({category.children.length} subs)
          </span>
        )}
      </TableCell>
      <TableCell>{category.slug}</TableCell>
      <TableCell>{category._count.products}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/categories/${category.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteCategoryButton id={category.id} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories);
  // We only support reordering top-level categories for now to keep it simple,
  // or we need nested SortableContexts.
  // As per requirement "Reorder categories visually", usually implies top level.
  // We can let children be static or reorderable within their parent?
  // Let's implement Top-Level reordering first.

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items: Category[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Optimistic update done, triggers server action
        // We need to map newItems order to IDs
        const updates = newItems.map((item, index) => ({
          id: item.id,
          displayOrder: index,
        }));

        // Call server action (fire and forget or await)
        import("@/app/actions").then((mod) => {
          mod.updateCategoryOrder(updates).catch((err) => {
            toast.error("Failed to save order");
            // Revert?
          });
        });

        return newItems;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>rub</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={categories.map((c: Category) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((category: Category) => (
                <>
                  <SortableCategoryRow
                    key={category.id}
                    category={category}
                    level={0}
                  />
                  {/* Render children as non-draggable or separate list? */}
                  {category.children.map((child: Category) => (
                    <TableRow
                      key={child.id}
                      className="hover:bg-muted/10 bg-gray-50/50"
                    >
                      <TableCell></TableCell>
                      <TableCell className="pl-10">
                        <div className="flex items-center">
                          <span className="border-l-2 border-b-2 w-3 h-3 mr-2 border-muted-foreground/30"></span>
                          {child.image ? (
                            <Image
                              src={child.image}
                              alt={child.name_en}
                              width={30}
                              height={30}
                              className="rounded-md object-cover aspect-square"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-[10px]">
                              No
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {child.name_en}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {child.slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {child._count.products}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/categories/${child.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteCategoryButton id={child.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}
