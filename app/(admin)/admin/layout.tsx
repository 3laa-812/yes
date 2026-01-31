import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 lg:flex-row">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-background px-4 py-8 lg:flex">
        <div className="flex h-12 items-center px-4 mb-8">
          <Link href="/" className="text-xl font-bold tracking-tight uppercase">
            YES ADMIN
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <ShoppingCart className="h-4 w-4" />
            Orders
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <Users className="h-4 w-4" />
            Customers
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
          </div>
          <form
            action={async () => {
              "use server";
              // We need to import signOut dynamically or from a server action file if 'auth' is not available here directly in client component structure?
              // Wait, layout is a server component by default in app dir.
              // So we can import signOut from "@/auth"
              const { signOut } = await import("@/auth");
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button size="sm" variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
