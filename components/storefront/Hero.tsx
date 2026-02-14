"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("HomePage");
  const tHero = useTranslations("Hero");
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85vh] w-full overflow-hidden bg-background flex items-center"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/20 -skew-x-12 transform origin-top-right z-0 hidden lg:block" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent z-10 lg:hidden" />

      <div className="container mx-auto px-4 md:px-6 relative z-20 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
          {/* Text Content */}
          <motion.div
            style={{ y: textY }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
            className="flex flex-col space-y-6 lg:col-span-6 lg:pr-12 order-2 lg:order-1 pt-20 lg:pt-0"
          >
            <div className="overflow-hidden">
              <motion.div
                variants={{
                  hidden: { y: "100%" },
                  visible: {
                    y: 0,
                    transition: { duration: 0.5, ease: "circOut" },
                  },
                }}
                className="flex items-center gap-2"
              >
                <span className="w-8 h-[2px] bg-accent inline-block rounded-full"></span>
                <span className="text-sm font-bold tracking-[0.2em] text-accent uppercase">
                  {t("newCollection")}
                </span>
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-foreground">
              <div className="overflow-hidden">
                <motion.span
                  className="block"
                  variants={{
                    hidden: { y: "100%", rotate: 2 },
                    visible: {
                      y: 0,
                      rotate: 0,
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  {t("redefine")}
                </motion.span>
              </div>
              <div className="overflow-hidden mt-1">
                <motion.span
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/80 pb-2"
                  variants={{
                    hidden: { y: "110%", rotate: -2 },
                    visible: {
                      y: 0,
                      rotate: 0,
                      transition: {
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
                        delay: 0.1,
                      },
                    },
                  }}
                >
                  {t("yourStyle")}
                </motion.span>
              </div>
            </h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: 0.2 },
                },
              }}
              className="text-lg md:text-xl text-muted-foreground/80 max-w-lg leading-relaxed font-medium"
            >
              {t("description")}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: 0.3 },
                },
              }}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full text-lg px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-shadow"
              >
                <Link href="/products">
                  {t("shopNow")}{" "}
                  <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full text-lg px-8 py-6 border-2 hover:bg-secondary/50"
              >
                <Link href="/collections">{t("exploreLookbook")}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            style={{ y }}
            className="lg:col-span-6 relative h-[500px] lg:h-[750px] w-full order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-10"
            >
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
                {/* Placeholder for Fashion Image */}
                <div className="w-full h-full bg-secondary relative flex items-center justify-center">
                  <Image
                    src="/hero-fashion.jpg"
                    alt={tHero("fashionModel")}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Dark gradient overlay for text readability on mobile if needed, though layout is split */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
                </div>
              </div>

              {/* Floating Statistic Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute bottom-8 left-8 bg-background/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 z-20 hidden md:block"
              >
                <div className="flex flex-col">
                  <span className="text-3xl font-black tabular-nums">2026</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {tHero("collection")}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/50 rounded-full blur-3xl -z-10 opacity-60" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
