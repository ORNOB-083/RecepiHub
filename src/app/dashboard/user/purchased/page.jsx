"use client";

import { useEffect, useState } from "react";

export default function Purchased() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/user/purchased")
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Purchased Recipes
      </h1>

      <div className="grid gap-4">
        {items.map((i) => (
          <div
            key={i._id}
            className="p-4 bg-white dark:bg-zinc-900 rounded-xl"
          >
            <p className="font-bold">{i.recipeName}</p>
            <p>Transaction: {i.transactionId}</p>
            <p>Amount: ${i.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}