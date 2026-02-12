import { Link } from "@/i18n/routing";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  ShieldCheck,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileSidebar } from "./_components/MobileSidebar";
import Image from "next/image";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import LanguageSwitcher from "@/components/global/LanguageSwitcher";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role || Role.USER;
  const { locale } = await params;
  const t = await getTranslations("Admin");

  if (role === Role.USER) {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}`);
  }

  const canManageAdmins = role === Role.OWNER;
  const canManageStore = role === Role.OWNER || role === Role.MANAGER;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 lg:flex-row">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-e bg-background px-4 py-8 lg:flex">
        <div className="flex flex-col px-4 mb-8">
          <div className="flex items-center gap-2 h-12">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/branding/logo-icon.png"
                alt="YES Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold tracking-tight uppercase">
                {t("title")}
              </span>
            </Link>
          </div>
          <div className="mt-2 ps-10">
            <Badge
              variant="outline"
              className="text-xs font-normal border-primary/50 text-foreground"
            >
              {role}
            </Badge>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard")}
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("orders")}
          </Link>
          {canManageStore && (
            <>
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Package className="h-4 w-4" />
                Categories
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Package className="h-4 w-4" />
                {t("products")}
              </Link>
              <Link
                href="/admin/customers"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Users className="h-4 w-4" />
                {t("customers")}
              </Link>
            </>
          )}
          {canManageAdmins && (
            <>
              <Link
                href="/admin/admins"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <ShieldCheck className="h-4 w-4" />
                {t("admins")}
              </Link>
              <Link
                href="/admin/activity"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <History className="h-4 w-4" />
                {t("activity")}
              </Link>
            </>
          )}
          {canManageStore && (
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              {t("settings")}
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
          <MobileSidebar role={role} />
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">
              {t("dashboard")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/auth");
                await signOut({ redirectTo: `/${locale}/auth/signin` });
              }}
            >
              <Button size="sm" variant="outline" type="submit">
                {t("signOut")}
              </Button>
            </form>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
