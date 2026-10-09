"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Youtube } from 'lucide-react';
import { StoreButton } from './footer/StoreButton';

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.51a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.84z" />
  </svg>
);

const socialLinks = [
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@mansurdrama.kz',
    Icon: TiktokIcon,
    color: 'group-hover:text-[#ff0050]',
    glow: 'group-hover:shadow-[0_0_15px_rgba(255,0,80,0.4)]',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/mansurdrama.kz',
    Icon: Instagram,
    color: 'group-hover:text-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    glow: 'group-hover:shadow-[0_0_15px_rgba(238,42,123,0.4)]',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@mansurdrama.kz',
    Icon: Youtube,
    color: 'group-hover:text-[#ff0000]',
    glow: 'group-hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]',
  },
];

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="relative py-1 text-white/60 hover:text-white transition-colors duration-300 group"
  >
    <span>{children}</span>
    <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent transition-all duration-300 group-hover:w-full" />
  </Link>
);

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <footer className="relative bg-[#050505] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-yellow-600/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />

      <motion.div
        className="relative max-w-7xl mx-auto px-6 py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                MansurDrama<span className="text-red-600">.kz</span>
              </h2>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                Қазақстанның ең үздік дорамалары мен эксклюзивті контентінің орталығы.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-3">
              {socialLinks.map(({ name, href, Icon, color, glow }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative h-12 w-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/60 transition-all duration-300 hover:scale-110 hover:text-white ${color} ${glow}`}
                  aria-label={name}
                >
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                </a>
              ))}
            </motion.div>
          </div>

          <div className="md:col-span-6 flex flex-col items-center md:items-end gap-6">
            <motion.div variants={itemVariants} className="text-center md:text-right space-y-2">
              <p className="text-sm text-white/40">Қосымшаны жүктеп алып, мүмкіндіктерді кеңейтіңіз</p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center md:justify-end gap-4">
              <StoreButton store="apple" href="#" delay={0.1} />
              <StoreButton store="google" href="https://play.google.com/store/apps/dev?id=5736552730820975762" delay={0.2} />
            </motion.div>
          </div>
        </div>

        <motion.div
          variants={itemVariants}
          className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10"
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.p
            variants={itemVariants}
            className="text-xs text-white/30"
          >
            © {new Date().getFullYear()} <span className="text-white/60">MansurDrama.kz</span> — Барлық құқықтар қорғалған.
          </motion.p>

          <nav aria-label="Footer" className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-white/40">
            <FooterLink href="/terms">Пайдалану шарттары</FooterLink>
            <span className="text-white/10 text-[8px]">●</span>
            <FooterLink href="/privacy">Құпиялық саясаты</FooterLink>
            <span className="text-white/10 text-[8px]">●</span>
            <a href="mailto:support@mansurdrama.kz" className="hover:text-white transition-colors duration-300">Қолдау</a>
          </nav>
        </div>
      </motion.div>
    </footer>
  );
}
