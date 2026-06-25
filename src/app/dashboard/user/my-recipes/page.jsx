"use client";

import { useEffect, useState } from "react";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch("/api/user/recipes")
      .then((res) => res.json())
      .then((data) => setRecipes(data));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`/api/user/recipes/${id}`, {
      method: "DELETE",
    });

    setRecipes(recipes.filter((r) => r._id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Recipes</h1>

      <div className="grid gap-4">
        {recipes.map((r) => (
          <div
            key={r._id}
            className="p-4 bg-white dark:bg-zinc-900 rounded-xl flex justify-between"
          >
            <div>
              <p className="font-bold">{r.recipeName}</p>
              <p className="text-sm text-gray-500">{r.category}</p>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded">
                Edit
              </button>

              <button
                onClick={() => handleDelete(r._id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}