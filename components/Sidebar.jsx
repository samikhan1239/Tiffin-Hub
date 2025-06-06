"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Home,
  Package,
  DollarSign,
  Bell,
  Users,
  Settings,
  Menu,
  X,
  User,
  Clock, // For Meal History
} from "lucide-react";

export default function Sidebar({ navItems = [], isOpen, setIsOpen }) {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);

  const iconMap = {
    Dashboard: Home,
    "Manage Tiffins": Package,
    Tiffins: Package,
    Enrolments: Package,
    Payments: DollarSign,
    Notifications: Bell,
    Admins: Users,
    Users: User,
    Profile: User,
    Settings: Settings,
    "Meal History": Clock,
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".sidebar-toggle")
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, setIsOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const defaultNavItems = {
    admin: [
      { href: "/dashboard/admin", label: "Dashboard" },
      { href: "/dashboard/admin/tiffins", label: "Manage Tiffins" },
      { href: "/dashboard/admin/meal-history", label: "Meal History" },
      { href: "/dashboard/admin/payments", label: "Payments" },
      { href: "/dashboard/admin/profile", label: "Profile" },
    ],
    user: [
      { href: "/dashboard/user", label: "Dashboard" },
      { href: "/dashboard/user/enrollments", label: "Enrolments" },
      { href: "/dashboard/user/meal-history", label: "Meal History" },
      { href: "/dashboard/user/notifications", label: "Notifications" },
      { href: "/dashboard/user/profile", label: "Profile" },
    ],
    superadmin: [
      { href: "/dashboard/superadmin", label: "Dashboard" },
      { href: "/dashboard/superadmin/admins", label: "Admins" },
      { href: "/dashboard/superadmin/users", label: "Users" },
      { href: "/dashboard/superadmin/tiffins", label: "Tiffins" },
      { href: "/dashboard/superadmin/payments", label: "Payments" },
      { href: "/dashboard/superadmin/settings", label: "Settings" },
    ],
  };

  if (isLoading) {
    return (
      <button
        className="sidebar-toggle fixed top-4 left-4 z-[100] bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        onClick={toggleSidebar}
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>
    );
  }

  const activeNavItems =
    navItems.length > 0 ? navItems : defaultNavItems[role] || [];

  return (
    <>
      {/* Toggle Button - Always Visible */}
      <button
        className="sidebar-toggle fixed top-4 left-4 z-[100] bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-sm z-50 pt-16 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <div className="absolute top-0 left-0 w-full h-16 flex items-center justify-between px-4 border-b border-slate-700 bg-slate-900/95 z-10">
          <h2 className="text-xl font-bold text-white">TiffinHub</h2>
          <button
            onClick={closeSidebar}
            className="text-gray-400 hover:text-white transition-colors p-2 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="p-4 mt-2 space-y-1">
          {activeNavItems.length === 0 ? (
            <div className="text-red-400 py-2 px-3">
              {role
                ? "No navigation items found for your role."
                : "Please sign in."}
            </div>
          ) : (
            activeNavItems.map((item, index) => {
              const Icon = iconMap[item.label] || Home;
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={closeSidebar}
                  className="flex items-center text-blue-300 hover:text-cyan-300 py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                  aria-label={`Navigate to ${item.label}`}
                >
                  <Icon className="mr-2 h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })
          )}
        </nav>
      </aside>
    </>
  );
}
