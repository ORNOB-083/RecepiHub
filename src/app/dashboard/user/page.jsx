"use client";

import { useEffect, useState } from "react";

export default function DashboardHome() {
  const [data, setData] = useState({
    recipes: 0,
    favorites: 0,
    likes: 0,
    isPremium: false,
  });

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl">
          My Recipes: {data.recipes}
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl">
          Favorites: {data.favorites}
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl">
          Likes: {data.likes}
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl">
          {data.isPremium ? "⭐ Premium User" : "Free User"}
        </div>

      </div>
    </div>
  );
}