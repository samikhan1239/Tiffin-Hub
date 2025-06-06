"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Tiffins() {
  const router = useRouter();
  const [tiffins, setTiffins] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTiffins = async () => {
      try {
        const res = await axios.get("/api/admin/tiffins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffins(res.data);
      } catch (err) {
        setError("Failed to fetch tiffins");
      }
    };
    fetchTiffins();
  }, []);

  const deactivateTiffin = async (tiffinId) => {
    if (
      !confirm(
        "Are you sure you want to deactivate this tiffin and all its enrollments?"
      )
    )
      return;
    try {
      await axios.post(
        `/api/admin/tiffins/${tiffinId}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTiffins((prev) => prev.filter((t) => t.id !== tiffinId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to deactivate");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">My Tiffins</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <Link href="/dashboard/admin/tiffins/add">
        <Button className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          Add New Tiffin
        </Button>
      </Link>
      <div className="space-y-4">
        {tiffins.map((tiffin) => (
          <Card
            key={tiffin.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <Link href={`/dashboard/admin/tiffins/${tiffin.id}`}>
                  <h2 className="text-xl text-white hover:underline">
                    {tiffin.name}
                  </h2>
                </Link>
                <p className="text-blue-300">
                  Total Price: ₹{tiffin.totalPrice}
                </p>
                <p className="text-blue-300">
                  Active: {tiffin.isActive ? "Yes" : "No"}
                </p>
              </div>
              {tiffin.isActive && (
                <Button
                  onClick={() => deactivateTiffin(tiffin.id)}
                  className="bg-red-500 text-white"
                >
                  Deactivate
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
