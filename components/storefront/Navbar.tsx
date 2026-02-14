"use client";

import { Link } from "@/i18n/routing";
import { ShoppingBag, User, Search, Menu, Package } from "lucide-react"; // Added Package icon
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { ShoppingCartModal } from "@/components/storefront/ShoppingCartModal";
import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/global/LanguageSwitcher";
import { useTranslations } from "next-intl";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories: { id: string; name: string; slug: string }[];
}

export function Navbar({
  user,
  categories = [],
}: {
  user?: any;
  categories?: Category[];
}) {
  const t = useTranslations("Navbar");
  const tCommon = useTranslations("Common");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  // Handle hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  // Combine static "All Products" with dynamic categories
  // We can prioritize specific categories if needed, but for now just list them
  // Or if categories are empty, fallback to static defaults for dev/testing
  const dynamicLinks =
    categories.length > 0
      ? categories.map((c) => ({
          href: `/collections/${c.slug}`,
          label: c.name,
          subCategories: c.subCategories,
          categorySlug: c.slug,
        }))
      : [
          {
            href: "/collections/men",
            label: t("men"),
            subCategories: [],
            categorySlug: "men",
          },
          {
            href: "/collections/kids",
            label: t("kids"),
            subCategories: [],
            categorySlug: "kids",
          },
          {
            href: "/collections/shoes",
            label: t("shoes"),
            subCategories: [],
            categorySlug: "shoes",
          },
        ];

  const allLinks = [
    ...dynamicLinks,
    {
      href: "/products",
      label: t("allProducts"),
      subCategories: [],
      categorySlug: "",
    },
  ];

  return (
    <>
      <nav className="w-full border-b border-white/5 bg-gradient-to-b from-background/80 to-background/20 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20">
          {/* Mobile Menu */}
          <div className="flex lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t("openMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex flex-col gap-6 p-6 w-[85vw] sm:w-[350px]"
              >
                <SheetTitle className="sr-only">{t("navigationMenu")}</SheetTitle>
                <div className="flex flex-col gap-8 mt-8">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative w-32 h-12"
                  >
                    <Image
                      src="/branding/logo-dark.png"
                      alt={t("logoAlt")}
                      fill
                      className="object-contain object-left"
                    />
                  </Link>
                  <div className="flex flex-col gap-6">
                    {allLinks.map((link) => (
                      <div key={link.href} className="flex flex-col gap-2">
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xl font-medium text-foreground/80 hover:text-primary transition-colors hover:translate-x-2 duration-200"
                        >
                          {link.label}
                        </Link>
                        {/* Mobile Subcategories */}
                        {link.subCategories &&
                          link.subCategories.length > 0 && (
                            <div className="pl-4 flex flex-col gap-2 border-l-2 border-muted ml-2">
                              {link.subCategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/collections/${link.categorySlug}?subCategoryId=${sub.id}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-base text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                  {/* Mobile Auth Links */}
                  <div className="border-t border-border pt-8 space-y-4">
                    {user ? (
                      <>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-lg font-medium text-foreground/80"
                        >
                          <Package className="w-5 h-5" />
                          {t("myOrders")}
                        </Link>
                        {user.role !== "USER" && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-lg font-medium text-foreground/80"
                          >
                            {t("adminDashboard")}
                          </Link>
                        )}
                        <Link
                          href="/signout"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-lg font-medium text-destructive"
                        >
                          {t("signOut")}
                        </Link>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Button asChild variant="outline" className="w-full">
                          <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {t("signIn")}
                          </Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link
                            href="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {t("register")}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex lg:flex-1 justify-center lg:justify-start">
            <Link
              href="/"
              className="relative w-32 h-10 lg:w-40 lg:h-12 transition-opacity hover:opacity-80"
            >
              <Image
                src="/branding/logo-dark.png"
                alt={t("logoAlt")}
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-10 items-center justify-center">
            {allLinks.map((link) => (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wide uppercase relative py-2"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
                {/* Desktop Dropdown for Subcategories */}
                {link.subCategories && link.subCategories.length > 0 && (
                  <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-background border rounded-md shadow-lg p-2 flex flex-col gap-1">
                      {link.subCategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/collections/${link.categorySlug}?subCategoryId=${sub.id}`}
                          className="text-sm px-3 py-2 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Icons */}
          <div className="flex flex-1 items-center justify-end gap-x-2 sm:gap-x-4">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* My Orders Icon - Visible directly for quick access */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full hidden sm:flex"
                title={t("myOrders")}
              >
                <Link href="/account/orders">
                  <Package className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || tCommon("guest")}
                    </p>
                    {user?.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/account/orders"
                        className="flex w-full items-center"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {t("myOrders")}
                      </Link>
                    </DropdownMenuItem>
                    {user.role !== "USER" && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/admin/dashboard">{t("adminDashboard")}</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Link href="/signout">{t("signOut")}</Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/login">{t("signIn")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/register">{t("register")}</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full relative group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>
      <ShoppingCartModal isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}
