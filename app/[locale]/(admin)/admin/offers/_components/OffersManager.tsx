"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Plus, Trash2, Edit } from "lucide-react";

import { SortableProductItem } from "./SortableProductItem";
import { createOffer, updateOffer, deleteOffer } from "@/app/actions/offers";
import { cn } from "@/lib/utils";

// Make the initial state generic to support any product model
export function OffersManager({
  initialOffers,
  products,
}: {
  initialOffers: any[];
  products: any[];
}) {
  const t = useTranslations("Admin.Offers");
  const locale = useLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  const [offers, setOffers] = useState(initialOffers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bundlePrice, setBundlePrice] = useState<string>("");

  // Product Search State
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setEditingId(null);
    setTitleEn("");
    setTitleAr("");
    setEnabled(true);
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedProductIds([]);
    setBundlePrice("");
    setSearchQuery("");
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (offer: any) => {
    setEditingId(offer.id);
    setTitleEn(offer.title_en);
    setTitleAr(offer.title_ar);
    setEnabled(offer.enabled);
    setStartDate(offer.startDate ? new Date(offer.startDate) : undefined);
    setEndDate(offer.endDate ? new Date(offer.endDate) : undefined);
    setSelectedProductIds(offer.productIds || []);
    setBundlePrice(offer.bundlePrice ? offer.bundlePrice.toString() : "");
    setSearchQuery("");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title_en: titleEn,
      title_ar: titleAr,
      enabled,
      startDate: startDate || null,
      endDate: endDate || null,
      productIds: selectedProductIds,
      bundlePrice: bundlePrice ? parseFloat(bundlePrice) : null,
    };

    startTransition(async () => {
      try {
        let updatedOffer: any;
        if (editingId) {
          updatedOffer = await updateOffer(editingId, data);
          setOffers((prev) =>
            prev.map((o) => (o.id === editingId ? { ...o, ...data } : o))
          );
        } else {
          updatedOffer = await createOffer(data);
          setOffers((prev) => [updatedOffer, ...prev]);
        }
        setIsDialogOpen(false);
        resetForm();
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    startTransition(async () => {
      try {
        await deleteOffer(id);
        setOffers((prev) => prev.filter((o) => o.id !== id));
      } catch (error) {
        console.error(error);
      }
    });
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedProductIds((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filteredProducts = products.filter((p) => {
    const search = searchQuery.toLowerCase();
    return (
      p.name_en.toLowerCase().includes(search) ||
      p.name_ar.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addOffer")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            {t("noOffers")}
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {locale === "ar" ? offer.title_ar : offer.title_en}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {offer.productIds?.length || 0} {t("products")}
                  </p>
                </div>
                <Badge variant={offer.enabled ? "default" : "secondary"}>
                  {offer.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>

              <div className="flex-1 text-sm space-y-1">
                <div className="flex gap-2 text-muted-foreground">
                  <span className="w-16 shrink-0">{t("startDate")}:</span>
                  <span>
                    {offer.startDate
                      ? format(new Date(offer.startDate), "PP", {
                          locale: dateLocale,
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <span className="w-16 shrink-0">{t("endDate")}:</span>
                  <span>
                    {offer.endDate
                      ? format(new Date(offer.endDate), "PP", {
                          locale: dateLocale,
                        })
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex-1"
                  onClick={() => openEditDialog(offer)}
                  disabled={isPending}
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  {t("editOffer")}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleDelete(offer.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("editOffer") : t("newOffer")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Management Dialog
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title_en">{t("nameLabel")}</Label>
                <Input
                  id="title_en"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-right" dir="rtl">
                <Label htmlFor="title_ar">{t("nameArLabel")}</Label>
                <Input
                  id="title_ar"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("startDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("endDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="enabled" className="text-base">
                {t("enabled")}
              </Label>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="bundlePrice">Bundle Price (EGP)</Label>
              <Input
                id="bundlePrice"
                type="number"
                placeholder="Optional manual price"
                value={bundlePrice}
                onChange={(e) => setBundlePrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This is the final price customers will pay for the entire bundle.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label className="text-base">{t("selectProducts")}</Label>

              <Input
                placeholder={t("searchProducts")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="grid gap-4 md:grid-cols-2 h-80">
                {/* Search / Selection List */}
                <div className="border rounded-md flex flex-col">
                  <div className="p-3 border-b bg-muted/50 font-medium text-sm">
                    {t("searchProducts")}
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {filteredProducts.map((p) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center justify-between p-2 rounded-md text-sm cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-primary/10 hover:bg-primary/20"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => toggleProduct(p.id)}
                          >
                            <span className="line-clamp-1 flex-1 pr-4">
                              {locale === "ar" ? p.name_ar : p.name_en}
                            </span>
                            {isSelected && (
                              <Badge variant="secondary" className="shrink-0">
                                Added
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Selected Products Area (Drag/Drop Sortable) */}
                <div className="border rounded-md flex flex-col bg-muted/10">
                  <div className="p-3 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
                    <span>Selected ({selectedProductIds.length})</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {t("dragToReorder")}
                    </span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4 flex flex-col gap-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={selectedProductIds}
                          strategy={verticalListSortingStrategy}
                        >
                          {selectedProductIds.map((id) => {
                            const p = products.find((p) => p.id === id);
                            if (!p) return null;
                            return (
                              <SortableProductItem
                                key={id}
                                id={id}
                                product={p}
                                onRemove={toggleProduct}
                                locale={locale}
                              />
                            );
                          })}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t relative z-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
