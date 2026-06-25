import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = session.user?.role || "user";
  
  redirect(`/dashboard/${role}`);
}