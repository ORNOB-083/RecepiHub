import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardSidebar from "./DashboardSidebar";

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex transition-colors duration-300">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0 text-black dark:text-white">
        {children}
      </main>
    </div>
  );
}