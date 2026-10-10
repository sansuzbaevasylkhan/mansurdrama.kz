"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StoreButtonProps {
  store: 'google' | 'apple';
  href: string;
  delay: number;
}

export const StoreButton = ({ store, href, delay }: StoreButtonProps) => {
  const isApple = store === 'apple';

  // Color constants
  const glowColor = isApple
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(66, 168, 83, 0.3)'; // Google Green

  const borderGlow = isApple
    ? 'group-hover:border-white/40'
    : 'group-hover:border-green-500/40';

  return (
    <motion.a
      href={href}
      aria-label={isApple ? "App Store-дан жүктеп алу" : "Google Play-ден жүктеп алу"}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{
        y: -6,
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "group relative h-14 px-6 rounded-[14px] flex items-center gap-3 overflow-hidden transition-all duration-300",
        "bg-white/[0.04] backdrop-blur-xl border border-white/10",
        borderGlow,
        "focus-visible:ring-2 focus-//ring-offset-2 focus:ring-white/50 outline-none"
      )}
    >
      {/* Shine Sweep Animation */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "linear",
          delay: isApple ? 0.5 : 0 // offset phase
        }}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
        }}
      />

      {/* Pulse Glow Background */}
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px ${glowColor}`,
          borderRadius: '14px'
        }}
      />

      {/* Logo with Floating Animation */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: isApple ? 0.5 : 0 }}
        className="relative z-20 flex items-center justify-center w-6 h-6"
      >
        {isApple ? (
          <motion.svg
            className="w-full h-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
            viewBox="0 0 384 512"
            fill="currentColor"
          >
            <path d="M318.7 268.7c-.2-36.3 16.4-64.2 50-64.2 14.2-14.2 28.4-14.2 38.8-14.2 10.6 0 17.6-12.6 28.4-12.6 11.2 0 17.2 12.2 28 12.2 11.2 0 24.5-15.7 44.7-15.7 18.3 0 34.3 12.6 44.7 28.4-15.6 36.7-12.1 66.9-12.1 66.9-16.7 2.7-36.3 12.5-49 12.5-12.8 0-25.3-12.5-34.3-12.5s-21.5 12.5-34.3 12.5c-12.8 0-25.7-12.5-34.3-12.5-12.6 0-24.5 12.5-34.3 12.5-12.8 0-25.3-12.5-34.3-12.5-12.8 0-24.5 12.5-34.3 12.5-12.8 0-25.7-12.5-34.3-12.5-12.8 0-24.5 12.5-34.3 12.5-12.8 0-25.7-12.5-34.3-12.5-12.8 0-24.5 12.5-34.3 12.5-12.8 0-25.7-12.5-34.3-12.5z"/>
          </motion.svg>
        ) : (
          <motion.svg
            className="w-full h-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3,20A1,1 0 0,1 2,19V5A1,1 0 0,1 3,4H21A1,1 0 0,1 22,5V19A1,1 0 0,1 21,20H3M3,5V19H21V5H3M13.5,12.5L16,15L18.5,12.5L13.5,12.5Z"/>
          </motion.svg>
        )}
      </motion.div>

      {/* Text Content */}
      <div className="relative z-20 flex flex-col justify-center ml-3 transition-transform duration-300 group-hover:translate-x-1">
        <span className="text-[10px] uppercase tracking-widest text-white/40 leading-none">
          {isApple ? "Download on the" : "Get it on"}
        </span>
        <span className="text-sm font-bold text-white leading-tight">
          {isApple ? "App Store" : "Google Play"}
        </span>
      </div>
    </motion.a>
  );
};

export { StoreButton };
