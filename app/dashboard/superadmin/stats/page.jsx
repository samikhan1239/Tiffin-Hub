"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function SuperadminStats() {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    totalUsers: 0,
    usersPerAdmin: [],
    tiffinsPerMonth: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/superadmin/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setStats(res.data);
      } catch (err) {
        setError("Failed to fetch statistics");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Statistics</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalAdmins}
            </div>
            <div className="text-sm text-blue-300">Total Admins</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.activeAdmins}
            </div>
            <div className="text-sm text-blue-300">Active Admins</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-blue-300">Total Users</div>
          </CardContent>
        </Card>
      </div>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Users Per Admin
      </h2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {stats.usersPerAdmin.map((admin) => (
          <Card
            key={admin.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white">{admin.name}</h3>
              <p className="text-blue-300">Users: {admin.userCount}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Tiffins Per Month
      </h2>
      <div className="space-y-4">
        {stats.tiffinsPerMonth.map((month) => (
          <Card
            key={month.month}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white">
                {month.month}
              </h3>
              <p className="text-blue-300">Tiffins: {month.tiffinCount}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
