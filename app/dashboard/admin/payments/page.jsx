"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

export default function Payments() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/payments/enrollment-stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setStats(res.data);
      } catch (err) {
        setError("Failed to fetch payment stats");
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-white">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Payment Summary</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl text-white mb-4">Current Month</h2>
          <p className="text-blue-300">
            Enrolled Tiffins: {stats.enrolledCount}
          </p>
          <p className="text-blue-300">
            Superadmin Surplus: {stats.enrolledCount} × ₹
            {stats.superadminSurplus} = ₹
            {stats.enrolledCount * stats.superadminSurplus}
          </p>
          <p className="text-blue-300">Admin Charge: ₹{stats.adminCharge}</p>
          <p className="text-white text-lg font-bold mt-2">
            Total: ₹{stats.totalAmount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
