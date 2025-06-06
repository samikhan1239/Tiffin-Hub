"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function SuperadminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: "/dashboard/superadmin", label: "Dashboard", icon: "Home" },
    {
      href: "/dashboard/superadmin/admin-management",
      label: "Admin Management",
      icon: "Users",
    },
    {
      href: "/dashboard/superadmin/stats",
      label: "Statistics",
      icon: "ClipboardList",
    },
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
