"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const stories = [
  {
    id: 1,
    name: "Jessica Miller",
    role: "Home Chef & Mom",
    story: "RecipeHub changed the way I cook for my family! The step-by-step guides are so simple, and my kids now look forward to dinner every single day. I even shared my grandma's secret pie recipe, and it got over 500 likes!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    rating: 5,
  },
  {
    id: 2,
    name: "Chef Raymond",
    role: "Culinary Blogger",
    story: "As a professional food blogger, finding a community this passionate is rare. The platform layout is highly interactive, dark mode is gorgeous, and the exposure my recipes received here skyrocketed my personal blog traffic.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 5,
  },
  {
    id: 3,
    name: "Amir Al-Hassan",
    role: "Cooking Enthusiast",
    story: "I could barely boil an egg properly before joining RecipeHub. Thanks to the expert preparation times and verified ingredient calculators, I can confidently cook a full three-course steak dinner for my friends now!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    rating: 5,
  },
];

const SuccessStories = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 14 },
    },
  };

  return (
    <section className="w-full py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#AE514B] dark:text-[#F5726B]">
            Community Love
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white">
            Success <span className="text-[#F5726B]">Stories</span> From Our Kitchens
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Discover how RecipeHub is helping home cooks grow, share, and master the art of cooking.
          </p>
        </div>

        {/* Stories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {stories.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="relative bg-gray-50/50 dark:bg-zinc-900 border border-[#DFD0BD]/30 dark:border-zinc-800 p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:bg-white dark:hover:bg-zinc-900/80 hover:shadow-xl"
            >
              {/* Decorative Quote Icon */}
              <div className="absolute top-6 right-8 text-3xl text-[#DFD0BD] dark:text-zinc-800 opacity-60 group-hover:text-[#F5726B] group-hover:scale-110 transition-all duration-300">
                <FaQuoteLeft />
              </div>

              {/* Story Content */}
              <div className="space-y-4">
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <FaStar key={i} className="text-amber-500 text-sm" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed italic">
                  "{item.story}"
                </p>
              </div>

              {/* User Bio info */}
              <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#F5726B]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#F5726B] transition-colors duration-300">
                    {item.name}
                  </h4>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                    {item.role}
                  </p>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default SuccessStories;