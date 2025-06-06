"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function UserLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: "/dashboard/user", label: "Dashboard", icon: "Home" },
    {
      href: "/dashboard/user/all-tiffins",
      label: "All Tiffins",
      icon: "Utensils",
    },
    {
      href: "/dashboard/user/enrolled-tiffins",
      label: "Enrolled Tiffins",
      icon: "CheckCircle",
    },
    {
      href: "/dashboard/user/daily-updates",
      label: "Daily Updates",
      icon: "Calendar",
    },
    { href: "/dashboard/user/profile", label: "Profile", icon: "User" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        navItems={navItems}
      />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
