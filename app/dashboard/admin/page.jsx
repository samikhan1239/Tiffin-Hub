"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminDashboard() {
  const [tiffins, setTiffins] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tiffins
        const tiffinsRes = await axios.get("/api/admin/tiffins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffins(tiffinsRes.data);

        // Fetch payment stats
        const paymentStatsRes = await axios.get(
          "/api/payments/enrollment-stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPaymentStats(paymentStatsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      {paymentStats && (
        <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-300">
              Enrolled Tiffins: {paymentStats.enrolledTiffins}
            </p>
            <p className="text-blue-300">
              Superadmin Surplus: ₹{paymentStats.superadminSurplus}
            </p>
            <p className="text-blue-300">
              Admin Charge: ₹{paymentStats.adminCharge}
            </p>
            <p className="text-blue-300">
              Total Amount: ₹{paymentStats.totalAmount}
            </p>
          </CardContent>
        </Card>
      )}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-white">Your Tiffins</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tiffins.map((tiffin) => (
              <li key={tiffin.id} className="text-white">
                {tiffin.name} - Active: {tiffin.isActive ? "Yes" : "No"}
              </li>
            ))}
          </ul>
          <Link href="/dashboard/admin/tiffins/add">
            <Button className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              Add New Tiffin
            </Button>
          </Link>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Link href="/dashboard/admin/tiffins">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            Manage Tiffins
          </Button>
        </Link>
        <Link href="/dashboard/admin/payments">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            View Payments
          </Button>
        </Link>
      </div>
    </div>
  );
}
