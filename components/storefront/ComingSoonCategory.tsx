"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PackageOpen, ArrowLeft } from "lucide-react";

export function ComingSoonCategory({ categoryName }: { categoryName: string }) {
  const t = useTranslations("Storefront.Collections");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center space-y-6 glass-card p-10 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="flex justify-center relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center rotate-3"
          >
            <PackageOpen className="w-12 h-12 text-primary -rotate-3" />
          </motion.div>
        </div>

        <div className="space-y-3 relative">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold tracking-tight text-foreground capitalize"
          >
            {categoryName}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground leading-relaxed"
          >
            We are currently curating an amazing collection for {categoryName}.
            Check back soon for premium new arrivals.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-6 relative"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full shadow-lg h-12 px-8 group"
          >
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {t("backToProducts", { fallback: "Back to Products" })}
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
