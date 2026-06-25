"use client";

import { motion } from "framer-motion";
import { FaUtensils, FaUsers, FaCheckCircle, FaAward } from "react-icons/fa";

const features = [
  {
    icon: <FaUtensils />,
    title: "Curated & Verified Recipes",
    description: "Every recipe on our platform is thoroughly tested and verified by culinary experts to ensure perfect results in your kitchen.",
    color: "text-[#F5726B] bg-[#F5726B]/10"
  },
  {
    icon: <FaUsers />,
    title: "Passionate Community",
    description: "Connect with thousands of food lovers, share cooking experiences, and exchange tips with home chefs worldwide.",
    color: "text-[#AE514B] bg-[#AE514B]/10"
  },
  {
    icon: <FaCheckCircle />,
    title: "Easy Step-by-Step Guides",
    description: "We provide clear, easy-to-follow instructions along with accurate ingredient measurements and preparation timers.",
    color: "text-[#2A6F8F] bg-[#2A6F8F]/10"
  },
  {
    icon: <FaAward />,
    title: "Share & Get Recognized",
    description: "Upload your signature dishes, build your culinary profile, collect badges, and get recognized as a top contributor.",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20"
  }
];

const WhyChooseUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 14 }
    }
  };

  return (
    <section className="w-full py-20 bg-gray-50/50 dark:bg-zinc-950/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#AE514B] dark:text-[#F5726B]">
            Our Value
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white">
            Why Cooking Lovers <br />
            Choose <span className="text-[#F5726B]">RecipeHub</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
            We bridge the gap between passion and perfection, providing the ultimate platform for discovering and creating incredible dishes.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                borderColor: "#F5726B",
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)"
              }}
              className="bg-white dark:bg-zinc-900 border border-[#DFD0BD]/40 dark:border-zinc-800 p-8 rounded-2xl transition-all duration-300 flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Icon Wrapper */}
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-2xl mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {item.icon}
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#F5726B] transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default WhyChooseUs;