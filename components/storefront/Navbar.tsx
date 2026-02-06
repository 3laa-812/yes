"use client";

import { Link } from "@/i18n/routing";
import { ShoppingBag, User, Search, Menu } from "lucide-react";
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

export function Navbar() {
  const t = useTranslations("Navbar");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  // Handl hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const navLinks = [
    { href: "/collections/women", label: t("women") },
    { href: "/collections/men", label: t("men") },
    { href: "/collections/accessories", label: t("accessories") },
    { href: "/products", label: t("allProducts") },
  ];

  return (
    <>
      <nav className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16">
          {/* Mobile Menu */}
          <div className="flex lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col gap-6 p-6">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 mt-6">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-bold tracking-tight uppercase"
                  >
                    <Image
                      src="/branding/logo-primary.png"
                      alt="YES Logo"
                      width={140}
                      height={50}
                      className="h-12 w-auto"
                    />
                  </Link>
                  <div className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/branding/logo-primary.png"
                alt="YES Logo"
                width={160}
                height={60}
                className="h-14 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex flex-1 items-center justify-end gap-x-4">
            <LanguageSwitcher />

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-black"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-black"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-black relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-[10px] font-bold text-white flex items-center justify-center">
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
