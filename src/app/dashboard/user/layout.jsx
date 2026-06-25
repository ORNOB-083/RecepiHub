import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-zinc-950">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-zinc-900 p-5 space-y-4">
        <h2 className="text-xl font-bold text-pink-500">
          User Dashboard
        </h2>

        <nav className="space-y-3">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/my-recipes">My Recipes</Link>
          <Link href="/dashboard/favorites">Favorites</Link>
          <Link href="/dashboard/purchased">Purchased</Link>
          <Link href="/dashboard/profile">Profile</Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}