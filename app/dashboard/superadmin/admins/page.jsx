"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("/api/superadmin/admins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAdmins(res.data);
      } catch (err) {
        setError("Failed to fetch admins");
      }
    };
    fetchAdmins();
  }, []);

  const toggleActive = async (adminId, isActive) => {
    try {
      await axios.patch(
        "/api/superadmin/admins",
        { adminId, isActive: !isActive },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAdmins((prev) =>
        prev.map((a) => (a.id === adminId ? { ...a, isActive: !isActive } : a))
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update admin");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Manage Admins</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="space-y-4">
        {admins.map((admin) => (
          <Card
            key={admin.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-white">{admin.name}</p>
                <p className="text-blue-300">{admin.email}</p>
                <p className="text-blue-300">
                  Active: {admin.isActive ? "Yes" : "No"}
                </p>
              </div>
              <Button
                onClick={() => toggleActive(admin.id, admin.isActive)}
                className={
                  admin.isActive
                    ? "bg-red-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                }
              >
                {admin.isActive ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
