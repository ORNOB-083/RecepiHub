"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const Banner = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 60, damping: 12 },
    },
  };

  return (
    <div className="relative w-full overflow-hidden min-h-[500px] md:min-h-[700px] bg-white dark:bg-zinc-950 transition-colors duration-300">
      
      <motion.div 
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none select-none dark:opacity-10"
      >
        <Image
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&fit=crop"
          alt="Kitchen background pattern"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-[#DFD0BD]/30 dark:bg-zinc-900/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-72 h-72 bg-[#F5726B]/10 dark:bg-zinc-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center h-full max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24 gap-12">
        
        <div className="relative flex-1 flex flex-col justify-center z-20 text-center lg:text-left">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="overflow-hidden">
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-6xl font-black text-black dark:text-white leading-tight tracking-tight"
              >
                Discover & Share <br />
                <span className="text-[#F5726B] inline-block relative">
                  Delicious Recipes
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
                    className="absolute bottom-1 left-0 h-[4px] bg-[#F5726B] rounded-full"
                  />
                </span>
              </motion.h1>
            </div>

            <motion.p
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-400 text-base md:text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Explore thousands of mouth-watering recipes from around the world, curated by passionate food lovers. Join our culinary community today!
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/browse"
                className="relative overflow-hidden bg-[#F5726B] text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-[#F5726B]/20 transition-all duration-300 group inline-block text-center"
              >
                <span className="relative z-10">Explore Recipes</span>
                <span className="absolute inset-0 bg-[#AE514B] scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
              </Link>
              <Link
                href="/dashboard/add-recipe"
                className="px-10 py-4 bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 font-bold rounded-xl border-2 border-[#DFD0BD] dark:border-zinc-800 hover:border-[#F5726B] dark:hover:border-[#F5726B] hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all duration-300 text-center"
              >
                Submit Recipe
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[450px] aspect-square md:max-w-[500px]"
          >
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotateZ: [0, 0.5, 0],
              }}
              whileHover={{ 
                scale: 1.02,
                rotateX: 5,
                rotateY: -5,
                transition: { duration: 0.3 }
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut",
              }}
              className="relative w-full h-full rounded-3xl p-1 bg-gradient-to-tr from-[#DFD0BD] via-transparent to-[#F5726B] shadow-2xl cursor-pointer"
            >
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[22px] overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&fit=crop"
                  alt="Delicious premium food item"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
};

export default Banner;