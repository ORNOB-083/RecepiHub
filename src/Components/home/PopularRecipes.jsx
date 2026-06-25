"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaUser } from "react-icons/fa";

const popularData = [
  {
    id: "1",
    recipeName: "Smoked Salmon Eggs Benedict",
    likesCount: 1240,
    authorName: "Sarah Jenkins",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&fit=crop"
  },
  {
    id: "2",
    recipeName: "Ultimate Fudgy Chocolate Brownies",
    likesCount: 985,
    authorName: "Chef Marco R.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&fit=crop"
  },
  {
    id: "3",
    recipeName: "Spicy Ramen Bowl with Egg",
    likesCount: 872,
    authorName: "Yuki Tanaka",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&fit=crop"
  },
];

const PopularRecipes = () => {
  return (
    <section className="w-full py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#AE514B] dark:text-[#F5726B]">
            Trending Now
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mt-1">
            Most <span className="text-[#F5726B]">Liked Recipes</span>
          </h2>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {popularData.map((recipe) => (
            <motion.div
              key={recipe.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
              }}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <Image
                  src={recipe.image}
                  alt={recipe.recipeName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <FaHeart className="text-[#F5726B]" />
                  <span>{recipe.likesCount}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#F5726B] transition-colors duration-300 line-clamp-2 leading-snug">
                  {recipe.recipeName}
                </h3>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-[#DFD0BD]/40 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-[#AE514B] dark:text-[#F5726B] shrink-0">
                      <FaUser />
                    </div>
                    <span className="truncate">{recipe.authorName}</span>
                  </div>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="bg-[#F5726B]/10 text-[#F5726B] dark:bg-zinc-800 dark:text-gray-200 px-3 py-1.5 rounded-md font-bold hover:bg-[#F5726B] hover:text-white dark:hover:bg-[#F5726B] dark:hover:text-white transition-all shrink-0"
                  >
                    View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default PopularRecipes;