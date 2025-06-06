"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/admin/tiffins", label: "Manage Tiffins" },
    { href: "/dashboard/admin/meal-history", label: "Meal History" }, // Optional
    { href: "/dashboard/admin/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 relative">
      <Sidebar navItems={navItems} isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main content with responsive padding-left for sidebar */}
      <main className="p-4 pt-20 transition-all duration-300 md:pl-64">
        {children}
      </main>
    </div>
  );
}
