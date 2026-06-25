"use client";

import { useState } from "react";

export default function Profile() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const updateProfile = async () => {
    await fetch("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name, image }),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="space-y-3 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />

        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
          className="w-full p-2 border rounded"
        />

        <button
          onClick={updateProfile}
          className="bg-pink-500 text-white px-4 py-2 rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
}