import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }) {
  const navItems = [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/admin/tiffins", label: "Manage Tiffins" },
    { href: "/dashboard/admin/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      <Sidebar navItems={navItems} />
      {/* Removed ml-64 since sidebar is now collapsible */}
      <main className="p-6 pt-16">{children}</main>
    </div>
  );
}
