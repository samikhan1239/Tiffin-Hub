"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Snowflake, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserRole(decoded.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/login");
  };

  return (
    <header className="relative z-50 backdrop-blur-xl bg-slate-900/50 border-b border-blue-500/20">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Tiffin Hub</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/tiffins"
              className="text-blue-300 hover:text-white transition-colors"
            >
              All Tiffins
            </Link>
            {isLoggedIn && userRole === "user" && (
              <Link
                href="/dashboard/user"
                className="text-blue-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}
            {isLoggedIn && userRole === "admin" && (
              <Link
                href="/dashboard/admin"
                className="text-blue-300 hover:text-white transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            {isLoggedIn && userRole === "superadmin" && (
              <Link
                href="/dashboard/superadmin"
                className="text-blue-300 hover:text-white transition-colors"
              >
                Superadmin Dashboard
              </Link>
            )}
          </div>
          <div>
            {isLoggedIn ? (
              <div className="relative group">
                <Button variant="ghost" className="text-white">
                  <User className="w-6 h-6" />
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-lg hidden group-hover:block">
                  <Link
                    href="/dashboard/user/profile"
                    className="block px-4 py-2 text-blue-300 hover:bg-blue-500/10"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-blue-300 hover:bg-blue-500/10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
