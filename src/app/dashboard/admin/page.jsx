"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null); // Initialize as null to catch the loading state

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Simple loading feedback while the API responds
  if (!stats) {
    return <div className="p-6 text-zinc-500">Loading overview stats...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Total Users</p>
          <p className="text-2xl font-semibold">{stats.users}</p>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Recipes</p>
          <p className="text-2xl font-semibold">{stats.recipes}</p>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Premium Members</p>
          <p className="text-2xl font-semibold">{stats.premium}</p>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Active Reports</p>
          <p className="text-2xl font-semibold text-red-500">{stats.reports}</p>
        </div>
      </div>
    </div>
  );
}