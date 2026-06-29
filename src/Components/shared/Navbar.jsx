"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useSession, authClient } from "@/lib/auth-client";
import { User, Settings, LogOut, Sun, Moon, Crown, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
const SYNCED_KEY = 'recipehub_user_synced';

async function syncUser(email, name, image) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, image: image || 'https://placehold.co/100' }),
    });
    if (res.ok) { localStorage.setItem(SYNCED_KEY, 'true'); return true; }
    return false;
  } catch { return false; }
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backendUser, setBackendUser] = useState(null);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ─── Load theme ──────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // ─── Sync user + fetch backend user (for isPremium & role) ──
  useEffect(() => {
    if (status === 'authenticated' && user?.email) {
      const synced = localStorage.getItem(SYNCED_KEY);
      if (!synced) {
        syncUser(user.email, user.name, user.image).then(() => {
          // eslint-disable-next-line react-hooks/immutability
          fetchBackendUser(user.email);
        });
      } else {
        fetchBackendUser(user.email);
      }
    }
  }, [status, user?.email]);

  const fetchBackendUser = async (email) => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        headers: { 'user-email': email },
      });
      if (res.ok) {
        const data = await res.json();
        setBackendUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch backend user:', err);
    }
  };

  // Re-fetch backend user when dropdown opens (to catch premium upgrades)
  useEffect(() => {
    if (isDropdownOpen && user?.email) {
      fetchBackendUser(user.email);
    }
  }, [isDropdownOpen]);

  // ─── Close dropdown on outside click ──────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Close mobile menu on route change ────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ─── Theme toggle ──────────────────────────────────────
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // ─── Logout ────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      localStorage.removeItem(SYNCED_KEY);
      setBackendUser(null);
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  const isActive = (path) =>
    pathname === path
      ? "text-[#F5726B] font-semibold md:border-b-2 md:border-[#F5726B] md:pb-1"
      : "text-gray-700 dark:text-gray-200 hover:text-[#F5726B] dark:hover:text-[#F5726B] transition-colors duration-200";

  const isPremium = backendUser?.isPremium || false;
  const role = backendUser?.role || 'user';

  // Profile route based on role
  const profileRoute = role === 'admin'
    ? '/dashboard/admin/profile'
    : '/dashboard/user/profile';

  // Dashboard route based on role
  const dashboardRoute = role === 'admin'
    ? '/dashboard/admin'
    : '/dashboard/user';

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Browse Recipes", path: "/recipes" },
  ];

  return (
    <nav className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#F5726B] hover:opacity-80 transition-opacity flex-shrink-0">
            RecipeHub
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {publicLinks.map((link) => (
              <Link key={link.path} href={link.path} className={`${isActive(link.path)} transition-all duration-200`}>
                {link.name}
              </Link>
            ))}
            {user && (
              <Link href={dashboardRoute} className={`${isActive(dashboardRoute)} transition-all duration-200`}>
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all duration-200 flex-shrink-0"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="focus:outline-none focus:ring-2 focus:ring-[#F5726B] rounded-full transition-shadow cursor-pointer relative"
                  aria-label="User menu"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 dark:border-zinc-800 hover:border-[#F5726B] transition-colors duration-200 relative flex-shrink-0">
                    <Image
                      src={backendUser?.image || user.image || "https://placehold.co/100"}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                      sizes="36px"
                      priority
                    />
                  </div>
                  {/* Premium crown badge on avatar */}
                  {isPremium && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
                      <Crown className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl rounded-xl overflow-hidden text-gray-700 dark:text-gray-200 animate-fadeIn">

                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm truncate">
                          {backendUser?.name || user.name || "User"}
                        </p>
                        {isPremium && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-bold flex-shrink-0">
                            <Crown className="w-2.5 h-2.5" /> Premium
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      {role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Profile link — routes to correct dashboard profile */}
                    <Link
                      href={profileRoute}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={16} className="flex-shrink-0" />
                      <span>Profile</span>
                    </Link>

                    {/* Dashboard link */}
                    <Link
                      href={dashboardRoute}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} className="flex-shrink-0" />
                      <span>Dashboard</span>
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200 border-t border-gray-200 dark:border-zinc-800 cursor-pointer"
                    >
                      <LogOut size={16} className="flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : status === 'loading' ? (
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-[#F5726B] dark:hover:text-[#F5726B] transition-colors duration-200 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#F5726B] hover:bg-[#e05f59] text-white px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-md transition-colors duration-200 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden py-4 border-t border-gray-200 dark:border-zinc-800 animate-slideDown">
            <div className="flex flex-col space-y-3">
              {publicLinks.map((link) => (
                <Link key={link.path} href={link.path}
                  className={`py-2 ${isActive(link.path)} transition-colors duration-200`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}

              {user ? (
                <>
                  <Link href={dashboardRoute}
                    className={`py-2 ${isActive(dashboardRoute)} transition-colors duration-200`}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href={profileRoute}
                    className={`py-2 ${isActive(profileRoute)} transition-colors duration-200`}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  {isPremium && (
                    <div className="flex items-center gap-1.5 py-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-bold text-yellow-500">Premium Member</span>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="py-2 text-red-500 font-semibold text-left hover:text-red-600 transition-colors duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : status !== 'loading' ? (
                <>
                  <Link href="/auth/login"
                    className="py-2 text-gray-700 dark:text-gray-200 hover:text-[#F5726B] transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/auth/signup"
                    className="bg-[#F5726B] hover:bg-[#e05f59] text-white px-4 py-2.5 rounded-md inline-block text-center transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Register
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-slideDown { animation: slideDown 0.2s ease-out; }
            `}</style>
    </nav>
  );
}