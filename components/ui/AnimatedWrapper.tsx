"use client";

import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fadeIn" | "scale" | "slideUp";
}

export const AnimatedWrapper = ({
  children,
  className,
  delay = 0,
  variant = "fadeIn",
}: AnimatedWrapperProps) => {
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.6, delay } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay } },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      custom={variant}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export const hoverScale =
  "transition-transform duration-300 hover:scale-105 active:scale-95";
export const glassEffect =
  "backdrop-blur-md bg-white/70 dark:bg-black/70 border border-white/20 shadow-lg";
