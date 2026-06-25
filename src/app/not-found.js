"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Utensils, Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center bg-white dark:bg-zinc-950 transition-colors duration-500 relative overflow-hidden">
      
      {/* Premium Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#DFD0BD]/20 via-transparent to-[#F5726B]/10 dark:from-zinc-900/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 w-72 h-72 bg-[#F5726B]/5 rounded-full blur-[80px] pointer-events-none animate-pulse" />

      {/* Floating Interactive Food Elements Badge */}
      <div className="relative mb-8">
        {/* Floating Background Fork/Knife Icon */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-6 -right-6 text-[#DFD0BD]/60 dark:text-zinc-800"
        >
          <Utensils size={32} strokeWidth={1.5} />
        </motion.div>

        {/* 404 Core Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative w-28 h-28 rounded-[2rem] p-[3px] bg-gradient-to-tr from-[#DFD0BD] via-[#F5726B]/20 to-[#F5726B] shadow-2xl drop-shadow-[0_10px_20px_rgba(245,114,107,0.15)]"
        >
          <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[30px] flex items-center justify-center font-black text-3xl text-zinc-900 dark:text-white relative overflow-hidden">
            <span className="bg-gradient-to-r from-[#F5726B] to-[#AE514B] bg-clip-text text-transparent">404</span>
          </div>
        </motion.div>
      </div>

      {/* Headline with fixed width property bug */}
      <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight max-w-xl leading-tight">
        This Page Is <br />
        <span className="text-[#F5726B] inline-block relative mt-2 px-2">
          Off The Menu!
          <motion.span 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 h-[4px] bg-gradient-to-r from-[#F5726B] to-[#DFD0BD] rounded-full" /* Fixed syntax typo 'h-[4p]' */
          />
        </span>
      </h1>

      <p className="text-gray-500 dark:text-zinc-400 text-base font-medium max-w-sm mt-6 leading-relaxed">
        We couldn&apos;t find the recipe page you were exploring. Let&apos;s return to our culinary timeline and cook something else!
      </p>

      {/* CTA Button Layout Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-md"
      >
        {/* Primary Action */}
        <Link
          href="/"
          className="relative overflow-hidden bg-[#F5726B] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#F5726B]/20 hover:shadow-xl hover:shadow-[#F5726B]/30 transition-all duration-300 group flex items-center justify-center gap-2 text-center flex-1 active:scale-[0.98]"
        >
          <Home size={18} className="transition-transform group-hover:-translate-y-0.5" />
          <span className="relative z-10">Back to Home</span>
          <span className="absolute inset-0 bg-[#AE514B] scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out -z-10" />
        </Link>
        
        {/* Secondary Action */}
        <Link
          href="/browse"
          className="px-8 py-3.5 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl border-2 border-[#DFD0BD]/80 dark:border-zinc-800 hover:border-[#F5726B] dark:hover:border-[#F5726B] hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all duration-300 flex items-center justify-center gap-2 text-center flex-1 active:scale-[0.98]"
        >
          <Compass size={18} className="text-gray-400 dark:text-zinc-500 transition-spin group-hover:rotate-45" />
          <span>Explore Recipes</span>
        </Link>
      </motion.div>

    </div>
  );
}