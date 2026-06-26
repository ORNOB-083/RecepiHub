import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-zinc-950">
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}