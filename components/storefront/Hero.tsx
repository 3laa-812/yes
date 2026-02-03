"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export function Hero() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] w-full overflow-hidden bg-background flex items-center"
    >
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-secondary/30 -skew-x-12 transform origin-top-right z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                  staggerChildren: 0.15,
                  delayChildren: 0.2,
                },
              },
            }}
            className="flex flex-col space-y-8"
          >
            <div className="overflow-hidden">
              <motion.span
                variants={{
                  hidden: { y: "100%" },
                  visible: {
                    y: 0,
                    transition: {
                      duration: 0.8,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    },
                  },
                }}
                className="inline-block text-sm font-semibold tracking-widest text-accent-foreground uppercase border-b border-accent-foreground pb-1"
              >
                New Collection 2026
              </motion.span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]">
              <div className="overflow-hidden">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "100%", opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.8,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      },
                    },
                  }}
                >
                  REDEFINE
                </motion.span>
              </div>
              <div className="overflow-hidden">
                <motion.span
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60"
                  variants={{
                    hidden: { y: "100%", opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.8,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      },
                    },
                  }}
                >
                  YOUR STYLE
                </motion.span>
              </div>
            </h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed"
            >
              Discover the essence of modern elegance. A collection designed for
              those who speak through their style.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="flex gap-4 pt-4"
            >
              <Link
                href="/products"
                className="group relative px-8 py-4 bg-primary text-primary-foreground font-medium text-lg overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-accent-foreground/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  Shop Now{" "}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                href="/collections"
                className="group px-8 py-4 border border-input bg-background/50 backdrop-blur-sm text-foreground font-medium text-lg hover:bg-secondary transition-colors"
              >
                Explore Lookbook
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            style={{ y }}
            className="relative h-[600px] lg:h-[800px] w-full hidden lg:block"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="absolute inset-0 animate-[float_6s_ease-in-out_infinite]"
            >
              {/* Placeholder for Fashion Image - using a gradient/abstract shape until user provides assets or we generate one */}
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 rounded-sm overflow-hidden relative shadow-2xl">
                {/* In a real scenario, this would be an Image component */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-20 text-9xl font-bold rotate-90">
                  FASHION
                </div>
                <Image
                  src="/hero-fashion.jpg" // Assuming we might want to generate this or use a placeholder
                  alt="Fashion Model"
                  fill
                  className="object-cover opacity-80 mix-blend-overlay" // Hidden by default until we have a real image
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>

              {/* Floating Elements */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-background p-6 shadow-xl border border-border hidden xl:block">
                <div className="h-full flex flex-col justify-between">
                  <span className="text-4xl font-bold">01</span>
                  <span className="text-sm text-muted-foreground uppercase tracking-wider">
                    Summer Collection
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}
