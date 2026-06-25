"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LayoutDashboard, User, Heart, CreditCard, 
  Plus, UtensilsCrossed, FileText, AlertTriangle,
  Users, LogOut, ChevronLeft, ChevronRight, 
  Shield, ChefHat, Menu, X, Star
} from "lucide-react";

const NAV_LINKS = {
  user: [
    { label: "Overview", href: "/dashboard/user", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/user/profile", icon: User },
    { label: "Favorite Recipes", href: "/dashboard/user/favorites", icon: Heart },
    { label: "Purchased Recipes", href: "/dashboard/user/purchased", icon: UtensilsCrossed },
    { label: "Order History", href: "/dashboard/user/orders", icon: CreditCard },
  ],
  vendor: [
    { label: "Overview", href: "/dashboard/chef", icon: LayoutDashboard },
    { label: "Chef Profile", href: "/dashboard/chef/profile", icon: User },
    { label: "Add New Recipe", href: "/dashboard/chef/add-recipe", icon: Plus },
    { label: "My Recipes", href: "/dashboard/chef/my-recipes", icon: UtensilsCrossed },
    { label: "Earnings Log", href: "/dashboard/chef/earnings", icon: CreditCard },
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
  admin: { label: "Admin", color: "from-zinc-800 to-zinc-950 dark:from-zinc-700 dark:to-zinc-900", icon: Shield },
};

export default function DashboardSidebar({ user: serverUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const user = serverUser;
  const role = user?.role || "user";
  
  const links = NAV_LINKS[role] || NAV_LINKS.user;
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const RoleIcon = roleConfig.icon;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err) {
      toast.error("Sign out execution failed.");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-black dark:text-white">
      <ToastContainer position="top-right" autoClose={1500} />

      <div className={`flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-900 ${isCollapsed ? "px-3" : ""}`}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">
              Recipe<span className="text-[#F5726B]">Hub</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-8 h-8 rounded-xl bg-gray-50 dark:bg-zinc-900 items-center justify-center text-gray-500 hover:text-[#F5726B] dark:hover:text-[#F5726B] transition-colors ml-auto cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className={`p-4 border-b border-gray-100 dark:border-zinc-900 ${isCollapsed ? "px-3" : ""}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="relative flex-shrink-0">
            <img
              src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=F5726B&color=fff&size=40`}
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-gray-100 dark:border-zinc-800"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r ${roleConfig.color} flex items-center justify-center shadow-sm`}>
              <RoleIcon className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-gradient-to-r ${roleConfig.color} text-white`}>
                {roleConfig.label}
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                isActive
                  ? "bg-[#F5726B] text-white shadow-lg shadow-[#F5726B]/10"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-[#F5726B] dark:hover:text-[#F5726B]"
              } ${isCollapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}

              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-zinc-900">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all cursor-pointer ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-900 shadow-sm transition-all duration-300 z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}>
        {SidebarContent()}
      </aside>

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
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="lg:hidden fixed top-0 left-0 h-full w-72 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-900 shadow-2xl z-50"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-500 cursor-pointer"
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