"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { User, Settings, LogOut, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
const SYNCED_KEY = 'recipehub_user_synced';

// ─── User Sync (optional, but ensures backend user exists) ──
async function syncUser(email, name, image) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, image: image || 'https://placehold.co/100' }),
    });
    if (res.ok) {
      localStorage.setItem(SYNCED_KEY, 'true');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ─── Load session & theme ──────────────────────────────────
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data } = await authClient.getSession();
        setSession(data || null);
        if (data?.user) {
          localStorage.setItem("session_user", JSON.stringify({
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
          }));
          // Sync user with backend if not synced yet
          const synced = localStorage.getItem(SYNCED_KEY);
          if (!synced) {
            await syncUser(data.user.email, data.user.name, data.user.image);
          }
        } else {
          localStorage.removeItem("session_user");
        }
      } catch {
        setSession(null);
        localStorage.removeItem("session_user");
      } finally {
        setIsLoading(false);
      }
    };

    // Load cached session
    const cached = localStorage.getItem("session_user");
    if (cached) {
      try {
        const user = JSON.parse(cached);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSession({ user });
      } catch {
        localStorage.removeItem("session_user");
      }
    }

    // Load theme
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    loadSession();
  }, []);

  // ─── Close dropdown on outside click ──────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Close mobile menu on route change ─────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ─── Theme toggle ──────────────────────────────────────────
  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  };

  // ─── Logout ────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setSession(null);
      localStorage.removeItem("session_user");
      localStorage.removeItem(SYNCED_KEY);
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const isActive = (path) => {
    return pathname === path
      ? "text-[#F5726B] font-semibold md:border-b-2 md:border-[#F5726B] md:pb-1"
      : "text-gray-700 dark:text-gray-200 hover:text-[#F5726B] dark:hover:text-[#F5726B] transition-colors duration-200";
  };

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Browse Recipes", path: "/recipes" },
  ];

  const authLinks = [{ name: "Dashboard", path: "/dashboard" }];

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-[#F5726B] hover:opacity-80 transition-opacity flex-shrink-0"
          >
            RecipeHub
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`${isActive(link.path)} transition-all duration-200`}
              >
                {link.name}
              </Link>
            ))}

            {session?.user &&
              authLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`${isActive(link.path)} transition-all duration-200`}
                >
                  {link.name}
                </Link>
              ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all duration-200 flex-shrink-0"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="focus:outline-none focus:ring-2 focus:ring-[#F5726B] rounded-full transition-shadow cursor-pointer"
                  aria-label="User menu"
                >
                  <Image
                    src={session.user.image || "https://placehold.co/100"}
                    alt={session.user.name || "User"}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-gray-200 dark:border-zinc-800 object-cover hover:border-[#F5726B] transition-colors duration-200"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl rounded-lg overflow-hidden text-gray-700 dark:text-gray-200 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                      <p className="font-semibold text-sm truncate">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={16} className="flex-shrink-0" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} className="flex-shrink-0" />
                      <span>Dashboard</span>
                    </Link>

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
            ) : !isLoading ? (
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
            ) : (
              <div className="w-[120px] h-8 hidden md:block" />
            )}

            <button
              className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-md transition-colors duration-200 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden py-4 border-t border-gray-200 dark:border-zinc-800 animate-slideDown"
          >
            <div className="flex flex-col space-y-3">
              {publicLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`py-2 ${isActive(link.path)} transition-colors duration-200`}
                  onClick={handleMobileLinkClick}
                >
                  {link.name}
                </Link>
              ))}

              {session?.user ? (
                <>
                  {authLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`py-2 ${isActive(link.path)} transition-colors duration-200`}
                      onClick={handleMobileLinkClick}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="py-2 text-red-500 font-semibold text-left hover:text-red-600 transition-colors duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : !isLoading ? (
                <>
                  <Link
                    href="/auth/login"
                    className="py-2 text-gray-700 dark:text-gray-200 hover:text-[#F5726B] transition-colors duration-200"
                    onClick={handleMobileLinkClick}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-[#F5726B] hover:bg-[#e05f59] text-white px-4 py-2.5 rounded-md inline-block text-center transition-all duration-200"
                    onClick={handleMobileLinkClick}
                  >
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
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}