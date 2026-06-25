"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Beverages",
];

const DUMMY_RECIPES = [
  {
    id: 1,
    title: "Pancake Delight",
    category: "Breakfast",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
    cookingTime: "20 mins",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Chicken Biryani",
    category: "Lunch",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600",
    cookingTime: "45 mins",
    rating: 4.9,
  },
  {
    id: 3,
    title: "Grilled Steak",
    category: "Dinner",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
    cookingTime: "35 mins",
    rating: 4.7,
  },
  {
    id: 4,
    title: "Chocolate Cake",
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
    cookingTime: "30 mins",
    rating: 5.0,
  },
  {
    id: 5,
    title: "Mango Smoothie",
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600",
    cookingTime: "10 mins",
    rating: 4.6,
  },
];

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const recipes = DUMMY_RECIPES.filter((recipe) => {
    const categoryMatch =
      selectedCategory === "All" ||
      recipe.category === selectedCategory;

    const searchMatch = recipe.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen w-full bg-white dark:bg-zinc-950 text-black dark:text-white py-12 px-6 lg:px-12">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Explore Our{" "}
          <span className="text-[#F5726B]">Culinary Menu</span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Search recipes and browse categories to discover your next meal.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              selectedCategory === category
                ? "bg-[#F5726B] text-white"
                : "bg-gray-100 dark:bg-zinc-900"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recipe Cards */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group bg-white dark:bg-zinc-900 rounded-3xl p-3 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <span className="absolute top-3 right-3 bg-white text-black px-3 py-1 rounded-lg text-xs font-bold">
                  {recipe.category}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-3">
                {recipe.title}
              </h3>

              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>⏱️ {recipe.cookingTime}</span>
                <span>⭐ {recipe.rating}</span>
              </div>

              <Link href={`/recipes/${recipe.id}`}>
  <button className="w-full bg-[#F5726B] hover:bg-[#e35d56] text-white py-2.5 rounded-xl font-semibold">
    View Details
  </button>
</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold">
            No Recipes Found
          </h3>

          <p className="text-gray-500 mt-2">
            Try another category or search keyword.
          </p>
        </div>
      )}
    </div>
  );
}