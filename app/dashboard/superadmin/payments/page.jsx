"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function SuperadminPaymentSummary() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    adminCharge: "",
    superadminSurplus: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await axios.get("/api/superadmin/payment-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch payment stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleUpdateSettings = async () => {
    try {
      const adminCharge = parseFloat(settings.adminCharge);
      const superadminSurplus = parseFloat(settings.superadminSurplus);
      if (isNaN(adminCharge) || adminCharge < 0) {
        setError("Admin Charge must be a valid non-negative number");
        return;
      }
      if (isNaN(superadminSurplus) || superadminSurplus < 0) {
        setError("Superadmin Surplus must be a valid non-negative number");
        return;
      }
      await axios.patch(
        "/api/superadmin/payment-settings",
        { adminCharge, superadminSurplus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // Update local stats to reflect new settings
      setStats((prev) =>
        prev.map((admin) => ({
          ...admin,
          adminCharge,
          superadminSurplus,
          totalAmount: admin.enrolledCount * superadminSurplus + adminCharge,
        }))
      );
      setSettings({ adminCharge: "", superadminSurplus: "" });
      setError("");
      setSuccess("Payment settings updated successfully");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update settings");
    }
  };

  // Get previously set charges from the first stat record (if available)
  const previousAdminCharge =
    stats.length > 0 ? stats[0].adminCharge.toFixed(2) : "N/A";
  const previousSuperadminSurplus =
    stats.length > 0 ? stats[0].superadminSurplus.toFixed(2) : "N/A";

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">
        Superadmin Payment Summary
      </h1>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded mb-4">
          {success}
        </div>
      )}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl text-white mb-4">Update Payment Settings</h2>
          <div className="mb-4 text-blue-300">
            <p>Current Admin Charge: ₹{previousAdminCharge}</p>
            <p>Current Superadmin Surplus: ₹{previousSuperadminSurplus}</p>
          </div>
          <div className="flex gap-4 items-center">
            <Input
              type="number"
              placeholder="New Admin Charge"
              value={settings.adminCharge}
              onChange={(e) =>
                setSettings({ ...settings, adminCharge: e.target.value })
              }
              min="0"
              step="0.01"
              className="bg-slate-800 text-white border-blue-500/30"
            />
            <Input
              type="number"
              placeholder="New Superadmin Surplus"
              value={settings.superadminSurplus}
              onChange={(e) =>
                setSettings({ ...settings, superadminSurplus: e.target.value })
              }
              min="0"
              step="0.01"
              className="bg-slate-800 text-white border-blue-500/30"
            />
            <Button
              onClick={handleUpdateSettings}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              Update Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      {loading && <p className="text-white">Loading payment stats...</p>}
      {!loading && stats.length === 0 && (
        <p className="text-white">No payment stats found.</p>
      )}
      {!loading && stats.length > 0 && (
        <div className="space-y-4">
          {stats.map((admin) => (
            <Card
              key={admin.adminId}
              className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <h2 className="text-xl text-white mb-4">
                  Admin: {admin.adminName} ({admin.adminEmail})
                </h2>
                <p className="text-blue-300">
                  Enrolled Tiffins: {admin.enrolledCount}
                </p>
                <p className="text-blue-300">
                  Superadmin Surplus: {admin.enrolledCount} × ₹
                  {admin.superadminSurplus.toFixed(2)} = ₹
                  {(admin.enrolledCount * admin.superadminSurplus).toFixed(2)}
                </p>
                <p className="text-blue-300">
                  Admin Charge: ₹{admin.adminCharge.toFixed(2)}
                </p>
                <p className="text-white text-lg font-bold mt-2">
                  Total: ₹{admin.totalAmount.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h2 className="text-xl text-white mb-4">Overall Summary</h2>
              <p className="text-blue-300">
                Total Enrolled Tiffins:{" "}
                {stats.reduce((sum, admin) => sum + admin.enrolledCount, 0)}
              </p>
              <p className="text-blue-300">
                Total Superadmin Surplus: ₹
                {stats
                  .reduce(
                    (sum, admin) =>
                      sum + admin.enrolledCount * admin.superadminSurplus,
                    0
                  )
                  .toFixed(2)}
              </p>
              <p className="text-blue-300">
                Total Admin Charge: ₹
                {stats
                  .reduce((sum, admin) => sum + admin.adminCharge, 0)
                  .toFixed(2)}
              </p>
              <p className="text-white text-lg font-bold mt-2">
                Grand Total: ₹
                {stats
                  .reduce((sum, admin) => sum + admin.totalAmount, 0)
                  .toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
