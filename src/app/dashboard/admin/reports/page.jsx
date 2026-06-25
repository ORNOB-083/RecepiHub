"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <div className="space-y-3">
        {reports.map((r) => (
          <div
            key={r._id}
            className="p-4 bg-white dark:bg-zinc-900 rounded-xl"
          >
            <p>Recipe ID: {r.recipeId}</p>
            <p>Reason: {r.reason}</p>
            <p>Status: {r.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}