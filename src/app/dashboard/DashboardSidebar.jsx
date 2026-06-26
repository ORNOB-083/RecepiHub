"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  User,
  Heart,
  CreditCard,
  Plus,
  UtensilsCrossed,
  AlertTriangle,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  ChefHat,
  Menu,
  X,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000").replace(/\/$/, "");
const SYNCED_KEY = "recipehub_user_synced";

// ─── User Sync ────────────────────────────────────────────────
async function syncUser(email, name, image) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, image: image || "https://placehold.co/100" }),
    });
    if (res.ok) {
      localStorage.setItem(SYNCED_KEY, "true");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Navigation Config ──────────────────────────────────────
const NAV_LINKS = {
  user: [
    { label: "Overview", href: "/dashboard/user", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/user/profile", icon: User },
    { label: "My Recipes", href: "/dashboard/user/my-recipes", icon: UtensilsCrossed },
    { label: "Add Recipe", href: "/dashboard/user/add-recipe", icon: Plus },
    { label: "Favorite Recipes", href: "/dashboard/user/favourites", icon: Heart },
    { label: "Purchased Recipes", href: "/dashboard/user/purchased", icon: CreditCard },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Admin Profile", href: "/dashboard/admin/profile", icon: User },
    { label: "Manage Recipes", href: "/dashboard/admin/recipes", icon: UtensilsCrossed },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Reported Items", href: "/dashboard/admin/reports", icon: AlertTriangle },
  ],
};

const ROLE_CONFIG = {
  user: { label: "Foodie", color: "from-amber-500 to-orange-500", icon: Star },
  vendor: { label: "Chef", color: "from-[#F5726B] to-[#AE514B]", icon: ChefHat },
  admin: { label: "Admin", color: "from-zinc-700 to-zinc-900", icon: Shield },
};

// ─── Component ──────────────────────────────────────────────
export default function DashboardSidebar({ user: serverUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const user = serverUser || session?.user;
  const role = user?.role || "user";
  const links = NAV_LINKS[role] || NAV_LINKS.user;
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const RoleIcon = roleConfig.icon;

  // ── Sync user on mount ────────────────────────────────────
  useEffect(() => {
    if (user?.email) {
      const synced = localStorage.getItem(SYNCED_KEY);
      if (!synced) {
        syncUser(user.email, user.name, user.image);
      }
    }
  }, [user]);

  // ── Sign Out ──────────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully!");
      setTimeout(() => router.push("/"), 1200);
    } catch {
      toast.error("Sign out failed.");
    }
  };

  // ─── Sidebar Content ──────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* ── Brand Header ── */}
      <div
        className={`relative overflow-hidden ${isCollapsed ? "px-3 py-4" : "px-6 py-5"
          } border-b border-gray-100 dark:border-zinc-900`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5726B]/5 to-orange-500/5 dark:from-[#F5726B]/10 dark:to-orange-500/10" />
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#F5726B]/10 dark:bg-[#F5726B]/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-orange-500/10 dark:bg-orange-500/20 blur-2xl" />

        <div className="relative flex items-center justify-between">
          {!isCollapsed ? (
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5726B] to-orange-500 flex items-center justify-center shadow-lg shadow-[#F5726B]/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Recipe<span className="text-[#F5726B]">Hub</span>
                </span>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 -mt-0.5 tracking-wider uppercase">
                  {role === "admin" ? "Admin Panel" : "Dashboard"}
                </p>
              </div>
            </Link>
          ) : (
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5726B] to-orange-500 flex items-center justify-center shadow-lg shadow-[#F5726B]/25 mx-auto"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-900 items-center justify-center text-gray-400 hover:text-[#F5726B] dark:hover:text-[#F5726B] transition-all hover:scale-105 cursor-pointer flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── User Profile ── */}
      <div
        className={`relative ${isCollapsed ? "px-3 py-4" : "px-6 py-5"
          } border-b border-gray-100 dark:border-zinc-900`}
      >
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-zinc-800 shadow-md">
              <img
                src={
                  user?.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "U"
                  )}&background=F5726B&color=fff&size=40&bold=true`
                }
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            {user?.isPremium && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-950">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                {user?.isPremium && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                    Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {user?.email}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${roleConfig.color} text-white`}
                >
                  <RoleIcon className="w-2.5 h-2.5" />
                  {roleConfig.label}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? "text-[#F5726B] bg-[#F5726B]/10 dark:bg-[#F5726B]/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/50"
                }
                ${isCollapsed ? "justify-center px-2" : ""}
              `}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#F5726B]" />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? "text-[#F5726B]" : ""
                  } group-hover:scale-105`}
              />

              {!isCollapsed && (
                <span className="flex-1">{link.label}</span>
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-zinc-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Sign Out ── */}
      <div className="p-3 border-t border-gray-100 dark:border-zinc-900">
        <button
          onClick={handleSignOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10
            transition-all duration-200 cursor-pointer group
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-11 h-11 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#F5726B] transition-colors cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen sticky top-0
          bg-white dark:bg-zinc-950
          border-r border-gray-100 dark:border-zinc-900
          shadow-sm
          transition-all duration-300 ease-in-out
          z-30
          ${isCollapsed ? "w-[72px]" : "w-[280px]"}
        `}
      >
        {SidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="lg:hidden fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-900 shadow-2xl z-50"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-500 hover:text-[#F5726B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              {SidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}