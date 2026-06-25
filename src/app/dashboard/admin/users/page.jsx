"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const toggleBlock = async (id) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
    });

    location.reload();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u._id}
            className="p-4 bg-white dark:bg-zinc-900 rounded-xl flex justify-between"
          >
            <div>
              <p>{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>

            <button
              onClick={() => toggleBlock(u._id)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              {u.isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}