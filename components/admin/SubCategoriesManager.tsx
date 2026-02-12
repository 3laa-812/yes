"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
} from "@/app/actions";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface SubCategoriesManagerProps {
  categoryId: string;
  initialSubCategories: SubCategory[];
}

export function SubCategoriesManager({
  categoryId,
  initialSubCategories,
}: SubCategoriesManagerProps) {
  const router = useRouter();
  const [subCategories, setSubCategories] =
    useState<SubCategory[]>(initialSubCategories);
  const [newSubCatName, setNewSubCatName] = useState("");
  const [newSubCatSlug, setNewSubCatSlug] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const autoSlug = (name: string, isEdit: boolean) => {
    const slug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    if (isEdit) setEditSlug(slug);
    else setNewSubCatSlug(slug);
  };

  const handleCreate = async () => {
    if (!newSubCatName || !newSubCatSlug) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("name", newSubCatName);
    formData.append("slug", newSubCatSlug);
    formData.append("categoryId", categoryId);

    try {
      const res = await createSubCategory(formData);
      if (res.success) {
        toast.success("SubCategory Created");
        setNewSubCatName("");
        setNewSubCatSlug("");
        router.refresh();
        // We should ideally fetch new list or optimistic update.
        // For simplified flow, reload works to sync server state if router.refresh() isn't enough for state (it's not).
        // But router.refresh() updates server components. 'initialSubCategories' is prop.
        // We need to either reload or manually append.
        // Optimistic append:
        // We don't have ID... so reload is best.
        window.location.reload();
      } else {
        toast.error(res.error as string);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    const formData = new FormData();
    formData.append("id", id);

    try {
      const res = await deleteSubCategory(formData);
      if (res.success) {
        setSubCategories((prev) => prev.filter((s) => s.id !== id));
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error(res.error as string);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  const startEdit = (sub: SubCategory) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditSlug(sub.slug);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const formData = new FormData();
    formData.append("id", editingId);
    formData.append("name", editName);
    formData.append("slug", editSlug);
    formData.append("categoryId", categoryId);

    try {
      const res = await updateSubCategory(formData);
      if (res.success) {
        toast.success("Updated");
        setSubCategories((prev) =>
          prev.map((s) =>
            s.id === editingId ? { ...s, name: editName, slug: editSlug } : s,
          ),
        );
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(res.error as string);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end border p-4 rounded-md bg-muted/40">
        <div className="grid gap-2 flex-1 w-full">
          <label className="text-sm font-medium">Name</label>
          <Input
            placeholder="New Sub-Category Name"
            value={newSubCatName}
            onChange={(e) => {
              setNewSubCatName(e.target.value);
              autoSlug(e.target.value, false);
            }}
          />
        </div>
        <div className="grid gap-2 flex-1 w-full">
          <label className="text-sm font-medium">Slug</label>
          <Input
            placeholder="slug"
            value={newSubCatSlug}
            onChange={(e) => setNewSubCatSlug(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add New"}
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  No sub-categories yet. Add one above.
                </TableCell>
              </TableRow>
            ) : (
              subCategories.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    {editingId === sub.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => {
                          setEditName(e.target.value);
                          autoSlug(e.target.value, true);
                        }}
                        className="h-8"
                      />
                    ) : (
                      <span className="font-medium">{sub.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === sub.id ? (
                      <Input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <span className="text-muted-foreground">{sub.slug}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === sub.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={saveEdit}
                            title="Save"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={cancelEdit}
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(sub)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(sub.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
