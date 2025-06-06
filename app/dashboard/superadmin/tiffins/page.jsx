"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

export default function SuperadminTiffins() {
  const [tiffins, setTiffins] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTiffins = async () => {
      try {
        const res = await axios.get("/api/superadmin/tiffins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffins(res.data);
      } catch (err) {
        setError("Failed to fetch tiffins");
      }
    };
    fetchTiffins();
  }, []);

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">All Tiffins</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="space-y-4">
        {tiffins.map((tiffin) => (
          <Card
            key={tiffin.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <h2 className="text-xl text-white">{tiffin.name}</h2>
              <p className="text-blue-300">Admin: {tiffin.admin.name}</p>
              <p className="text-blue-300">Total Price: ₹{tiffin.totalPrice}</p>
              <p className="text-blue-300">
                Dietary Preferences: {tiffin.dietaryPrefs}
              </p>
              <p className="text-blue-300">
                Active: {tiffin.isActive ? "Yes" : "No"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
