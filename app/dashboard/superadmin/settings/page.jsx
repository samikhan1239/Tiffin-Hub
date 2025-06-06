"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  const [surplus, setSurplus] = useState("100");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/superadmin/settings", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSurplus(res.data.superadminSurplus.toString());
      } catch (err) {
        setError("Failed to fetch settings");
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        "/api/superadmin/settings",
        { superadminSurplus: parseFloat(surplus) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setError("");
      alert("Settings updated");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update settings");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-blue-300">Superadmin Surplus (₹)</label>
              <Input
                type="number"
                value={surplus}
                onChange={(e) => setSurplus(e.target.value)}
                className="bg-slate-800 text-white border-blue-500/30"
                required
                min="0"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
