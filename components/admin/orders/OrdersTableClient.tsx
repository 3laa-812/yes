"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOrder, deleteOrdersBulk } from "@/app/[locale]/(admin)/actions";
import { formatCurrency } from "@/lib/utils";

// Custom fixed modal since shadcn AlertDialog might not be fully installed
function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isLoading && onCancel()}
      />
      <div className="relative z-50 w-full max-w-md overflow-hidden rounded-lg bg-background p-6 shadow-xl border sm:mx-0 mx-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrdersTableClient({
  orders,
  locale,
  currentRole,
}: {
  orders: any[];
  locale: string;
  currentRole?: string;
}) {
  const t = useTranslations("Admin.Orders");
  const statusT = useTranslations("Storefront.Status");
  const dateLocale = locale === "ar" ? ar : enUS;

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const canDelete = currentRole === "OWNER" || currentRole === "MANAGER";

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id)
        ? prev.filter((orderId) => orderId !== id)
        : [...prev, id],
    );
  };

  const handleDeleteSingle = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete);
      toast.success(t?.("deleteSuccess") || "Order deleted successfully");
      setSelectedOrders((prev) => prev.filter((id) => id !== orderToDelete));
    } catch (error) {
      console.error(error);
      toast.error(t?.("deleteFailed") || "Failed to delete order");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteBulk = async () => {
    if (selectedOrders.length === 0) return;
    setIsDeleting(true);
    try {
      await deleteOrdersBulk(selectedOrders);
      toast.success(
        t?.("deleteBulkSuccess") ||
          `Successfully deleted ${selectedOrders.length} orders`,
      );
      setSelectedOrders([]);
    } catch (error) {
      console.error(error);
      toast.error(t?.("deleteFailed") || "Failed to delete orders");
    } finally {
      setIsDeleting(false);
      setBulkDeleteModalOpen(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setOrderToDelete(id);
    setDeleteModalOpen(true);
  };

  return (
    <>
      {/* Bulk actions bar */}
      {selectedOrders.length > 0 && canDelete && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3 px-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <span className="text-sm font-medium">
            {selectedOrders.length}{" "}
            {selectedOrders.length === 1 ? "order" : "orders"} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                {canDelete && (
                  <th className="h-12 w-12 px-4 text-center align-middle">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer align-middle"
                      checked={
                        selectedOrders.length > 0 &&
                        selectedOrders.length === orders.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("orderId")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("customer")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("phone")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("status")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("method")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("payment")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("total")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("date")}
                </th>
                <th className="h-12 px-4 text-end align-middle font-medium text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {orders.map((order: any) => {
                const isSelected = selectedOrders.includes(order.id);
                return (
                  <tr
                    key={order.id}
                    className={`border-b transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted/30" : ""}`}
                  >
                    {canDelete && (
                      <td className="p-4 align-middle text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer align-middle"
                          checked={isSelected}
                          onChange={() => handleSelectOne(order.id)}
                        />
                      </td>
                    )}
                    <td className="p-4 align-middle font-medium">
                      #{order.id.slice(-6)}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {order.shippingAddress?.name ||
                            order.user?.name ||
                            t("guest")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.user?.email ||
                            order.shippingAddress?.email ||
                            ""}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-nowrap">
                      {order.shippingAddress?.phone || order.user?.phone || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={
                          order.status === "DELIVERED" ? "default" : "secondary"
                        }
                      >
                        {statusT(order.status)}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-nowrap">
                      {order.paymentMethod}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={
                          order.paymentStatus === "PAID"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-nowrap">
                      {formatCurrency(Number(order.total), locale)}
                    </td>
                    <td className="p-4 align-middle text-nowrap">
                      {format(new Date(order.createdAt), "MMM d, yyyy", {
                        locale: dateLocale,
                      })}
                    </td>
                    <td className="p-4 align-middle text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            {t("details")}
                          </Link>
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => openDeleteModal(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={canDelete ? 10 : 9}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {t("noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Order?"
        description="This action cannot be undone. This will permanently delete the order and remove its data from our servers."
        isLoading={isDeleting}
        onConfirm={handleDeleteSingle}
        onCancel={() => {
          setDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
      />

      <ConfirmModal
        isOpen={bulkDeleteModalOpen}
        title="Delete Multiple Orders?"
        description={`You are about to delete ${selectedOrders.length} orders. This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDeleteBulk}
        onCancel={() => setBulkDeleteModalOpen(false)}
      />
    </>
  );
}
