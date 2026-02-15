"use client";

import { useRamadan } from "./RamadanContext";
import { motion } from "framer-motion";

export const RamadanDecorations = () => {
  const { isRamadan } = useRamadan();

  if (!isRamadan) return null;

  // Generate random positions for stars
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`, // Full height coverage
    left: `${Math.random() * 100}%`,
    size: Math.random() > 0.7 ? 3 : 2,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 3,
  }));

  return (
    <>
      {/* Background Layer - Stars & Gradient (Behind Content) */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {/* Background Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] transition-opacity duration-1000"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, var(--ramadan-gold), transparent 70%)",
          }}
        />

        {/* Twinkling Stars - Expanded & Subtle */}
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
            className="absolute"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-ramadan-gold/60"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Foreground Layer - Lanterns & Moon (Above Header) */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {/* Elegant Crescent Moon - Top Left */}
        <motion.div
          initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute left-[-10px] md:left-4 top-16 md:top-20 z-10 opacity-90 mix-blend-screen"
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-28 h-28 md:w-40 md:h-40"
          >
            {/* Enhanced Outer Glow */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="url(#moonGlow)"
              opacity="0.3"
            >
              <animate
                attributeName="r"
                values="90;98;90"
                dur="5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.15;0.3"
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>

            <defs>
              <radialGradient
                id="moonGradient"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(100 100) rotate(90) scale(80)"
              >
                <stop stopColor="var(--ramadan-gold)" />
                <stop offset="1" stopColor="var(--ramadan-gold-dark)" />
              </radialGradient>
              <radialGradient
                id="moonGlow"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(100 100) rotate(90) scale(90)"
              >
                <stop stopColor="var(--ramadan-gold)" />
                <stop offset="1" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Crescent */}
            <path
              d="M140 30 C 100 30, 60 70, 60 120 C 60 170, 100 210, 150 210 C 130 210, 110 190, 110 120 C 110 50, 140 30, 140 30 Z"
              fill="url(#moonGradient)"
              transform="rotate(-15 105 120)"
              filter="drop-shadow(0 0 15px rgba(212, 175, 55, 0.4))"
            />
          </svg>
        </motion.div>

        {/* Hanging Lantern - Left Side (Functioning as Balance) */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 1 }}
          className="absolute left-10 md:left-20 top-0 z-10 origin-top hidden md:block"
          style={{ animation: "swing 6s ease-in-out infinite 1.5s" }}
        >
          <svg
            width="50"
            height="200"
            viewBox="0 0 60 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <line
              x1="30"
              y1="0"
              x2="30"
              y2="60"
              stroke="var(--ramadan-gold-dark)"
              strokeWidth="1.5"
            />
            <g transform="translate(0, 60) scale(0.7) translate(2.86, 0)">
              <path
                d="M40 0 L55 15 L65 40 L55 90 L25 90 L15 40 L25 15 Z"
                fill="rgba(255,255,255,0.05)"
                stroke="var(--ramadan-gold)"
                strokeWidth="1.5"
              />
              <circle
                cx="40"
                cy="50"
                r="8"
                fill="#FFF8E7"
                filter="blur(3px)"
                opacity="0.5"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;0.6;0.3"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <line
                x1="40"
                y1="90"
                x2="40"
                y2="120"
                stroke="var(--ramadan-gold-dark)"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </motion.div>

        {/* Lantern Group - Right Side - Harmonic Arrangement */}
        <div className="absolute right-0 top-0 w-full h-[500px] pointer-events-none">
          {/* Main Large Lantern - Right */}
          <motion.div
            initial={{ y: -150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="absolute right-6 md:right-24 top-0 z-20 origin-top"
            style={{ animation: "swing 8s ease-in-out infinite" }}
          >
            <svg
              width="80"
              height="300"
              viewBox="0 0 80 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl"
            >
              <line
                x1="40"
                y1="0"
                x2="40"
                y2="100"
                stroke="var(--ramadan-gold-dark)"
                strokeWidth="1.5"
              />
              <g transform="translate(0, 100)">
                <path
                  d="M40 0 L55 15 L65 40 L55 90 L25 90 L15 40 L25 15 Z"
                  fill="rgba(255,255,255,0.08)"
                  stroke="var(--ramadan-gold)"
                  strokeWidth="1.5"
                />
                <path
                  d="M40 15 L40 90 M25 40 L55 40 M25 65 L55 65"
                  stroke="var(--ramadan-gold)"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
                <circle
                  cx="40"
                  cy="50"
                  r="8"
                  fill="#FFF8E7"
                  filter="blur(5px)"
                  opacity="0.8"
                >
                  <animate
                    attributeName="opacity"
                    values="0.6;0.9;0.6"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <line
                  x1="40"
                  y1="90"
                  x2="40"
                  y2="140"
                  stroke="var(--ramadan-gold-dark)"
                  strokeWidth="1.5"
                />
                <circle cx="40" cy="142" r="2" fill="var(--ramadan-gold)" />
              </g>
            </svg>
          </motion.div>

          {/* Medium Lantern - Farther Right & Higher */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.8 }}
            className="absolute right-2 md:right-8 top-[-20px] z-10 origin-top"
            style={{ animation: "swing 6s ease-in-out infinite 1s" }}
          >
            <svg
              width="60"
              height="200"
              viewBox="0 0 60 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="30"
                y1="0"
                x2="30"
                y2="50"
                stroke="var(--ramadan-gold-dark)"
                strokeWidth="1.5"
              />
              <g transform="translate(0, 50) scale(0.8) translate(-2.5, 0)">
                <path
                  d="M40 0 L55 15 L65 40 L55 90 L25 90 L15 40 L25 15 Z"
                  fill="rgba(255,255,255,0.05)"
                  stroke="var(--ramadan-gold)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="40"
                  cy="50"
                  r="8"
                  fill="#FFF8E7"
                  filter="blur(3px)"
                  opacity="0.5"
                >
                  <animate
                    attributeName="opacity"
                    values="0.3;0.6;0.3"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <line
                  x1="40"
                  y1="90"
                  x2="40"
                  y2="120"
                  stroke="var(--ramadan-gold-dark)"
                  strokeWidth="1.5"
                />
              </g>
            </svg>
          </motion.div>

          {/* Small Lantern - Left of Main - Lower */}
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 1.2 }}
            className="absolute right-24 md:right-52 top-[-10px] z-5 origin-top hidden sm:block"
            style={{ animation: "swing 9s ease-in-out infinite 2s" }}
          >
            <svg
              width="50"
              height="180"
              viewBox="0 0 60 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="30"
                y1="0"
                x2="30"
                y2="70"
                stroke="var(--ramadan-gold-dark)"
                strokeWidth="1.5"
              />
              <g transform="translate(0, 70) scale(0.6) translate(10, 0)">
                <path
                  d="M40 0 L55 15 L65 40 L55 90 L25 90 L15 40 L25 15 Z"
                  fill="rgba(255,255,255,0.05)"
                  stroke="var(--ramadan-gold)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="40"
                  cy="50"
                  r="8"
                  fill="#FFF8E7"
                  filter="blur(3px)"
                  opacity="0.4"
                >
                  <animate
                    attributeName="opacity"
                    values="0.2;0.5;0.2"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <line
                  x1="40"
                  y1="90"
                  x2="40"
                  y2="120"
                  stroke="var(--ramadan-gold-dark)"
                  strokeWidth="1.5"
                />
              </g>
            </svg>
          </motion.div>
        </div>
      </div>
    </>
  );
};
