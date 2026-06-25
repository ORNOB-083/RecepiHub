"use client";

import { useEffect, useState } from "react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch("/api/admin/recipes")
      .then((res) => res.json())
      .then((data) => setRecipes(data));
  }, []);

  const featureRecipe = async (id) => {
    await fetch(`/api/admin/recipes/${id}/feature`, {
      method: "PATCH",
    });

    location.reload();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Recipes</h1>

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

            <button
              onClick={() => featureRecipe(r._id)}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              {r.isFeatured ? "Featured" : "Feature"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}