"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";

export default function UserDashboard() {
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    acceptedUpdates: 0,
    rejectedUpdates: 0,
    remainingTiffins: 0,
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await axios.get("/api/user/enrollments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError("Failed to load dashboard data");
      }
    };
    fetchStats();
  }, [router]);

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">User Dashboard</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalEnrolled}
            </div>
            <div className="text-sm text-blue-300">Total Enrolled Tiffins</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.acceptedUpdates}
            </div>
            <div className="text-sm text-blue-300">Accepted Updates</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.rejectedUpdates}
            </div>
            <div className="text-sm text-blue-300">Rejected Updates</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.remainingTiffins}
            </div>
            <div className="text-sm text-blue-300">Remaining Tiffins</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        >
          <Link href="/dashboard/user/all-tiffins">Browse All Tiffins</Link>
        </Button>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        >
          <Link href="/dashboard/user/enrolled-tiffins">
            My Enrolled Tiffins
          </Link>
        </Button>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        >
          <Link href="/dashboard/user/daily-updates">Daily Updates</Link>
        </Button>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        >
          <Link href="/dashboard/user/notifications">Notifications</Link>
        </Button>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        >
          <Link href="/dashboard/user/profile">My Profile</Link>
        </Button>
      </div>
    </div>
  );
}
