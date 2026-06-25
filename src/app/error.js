"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";

export default function Error({ error, reset }) {
  const [openDetails, setOpenDetails] = useState(false);

  useEffect(() => {
    if (error?.message?.includes("NEXT_NOT_FOUND") || error?.digest?.includes("NEXT_NOT_FOUND")) {
      notFound();
    }
    console.error("Runtime Error Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 py-12 text-center bg-white dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden">
      
      <div className="absolute bottom-0 left-0 -z-10 w-80 h-80 bg-[#F5726B]/10 dark:bg-zinc-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-[#DFD0BD] via-transparent to-[#F5726B] shadow-xl mb-6"
      >
        <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[22px] flex items-center justify-center text-[#F5726B]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-10 h-10 animate-pulse">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          </svg>
        </div>
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tight leading-tight">
        The Kitchen Is <br />
        <span className="text-[#F5726B] inline-block relative mt-1">
          Overheating!
          <motion.span 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
            className="absolute bottom-1 left-0 h-[4px] bg-[#F5726B] rounded-full"
          />
        </span>
      </h1>

      <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium max-w-sm mt-4 leading-relaxed">
        Something unexpected happened while preparing this section. Lets try resetting the stove grid!
      </p>

      <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-sm">
        
        <button
          onClick={() => reset()}
          className="relative overflow-hidden w-full bg-[#F5726B] text-white py-4 rounded-xl font-bold shadow-xl shadow-[#F5726B]/10 hover:shadow-2xl transition-all duration-300 group cursor-pointer active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            <span>Restart Stove (Try Again)</span>
          </span>
          <span className="absolute inset-0 bg-[#AE514B] scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
        </button>

        <div className="w-full border border-gray-100 dark:border-zinc-900 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-zinc-900/30">
          <button
            onClick={() => setOpenDetails(!openDetails)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-zinc-900/60 transition-colors"
          >
            <span>{openDetails ? "Hide Error Code" : "Show Error Code"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 transition-transform duration-300 ${openDetails ? "rotate-180" : ""}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </button>

          {openDetails && (
            <div className="p-4 bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 text-left text-xs font-mono text-red-400 overflow-x-auto max-h-36 whitespace-pre-wrap select-all">
              {error?.message || error?.toString() || "Unknown server rendering error."}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}