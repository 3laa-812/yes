"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Role } from "@prisma/client";
import { useTranslations } from "next-intl";

interface MobileSidebarProps {
  role: Role;
}

export const MobileSidebar = ({ role }: MobileSidebarProps) => {
  const t = useTranslations("Admin");
  const [open, setOpen] = useState(false);

  const canManageAdmins = role === Role.OWNER;
  const canManageStore = role === Role.OWNER || role === Role.MANAGER;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">{t("title")}</span>
            {t("title")}
          </Link>
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard")}
          </Link>
          <Link
            href="/admin/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("orders")}
          </Link>
          {canManageStore && (
            <>
              <Link
                href="/admin/categories"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Package className="h-4 w-4" />
                Categories
              </Link>
              <Link
                href="/admin/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Package className="h-4 w-4" />
                {t("products")}
              </Link>
              <Link
                href="/admin/customers"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Users className="h-4 w-4" />
                {t("customers")}
              </Link>
            </>
          )}
          {canManageAdmins && (
            <Link
              href="/admin/admins"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <ShieldCheck className="h-4 w-4" />
              {t("admins")}
            </Link>
          )}
          {canManageStore && (
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              {t("settings")}
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
