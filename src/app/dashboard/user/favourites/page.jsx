"use client";

import { useEffect, useState } from "react";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch("/api/user/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(data));
  }, []);

  const removeFavorite = async (id) => {
    await fetch(`/api/user/favorites/${id}`, {
      method: "DELETE",
    });

    setFavorites(favorites.filter((f) => f._id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>

      <div className="grid gap-4">
        {favorites.map((f) => (
          <div
            key={f._id}
            className="p-4 bg-white dark:bg-zinc-900 rounded-xl flex justify-between"
          >
            <p>{f.recipeName}</p>

            <button
              onClick={() => removeFavorite(f._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}