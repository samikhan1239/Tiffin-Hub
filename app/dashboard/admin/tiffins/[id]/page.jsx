"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function TiffinDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [tiffin, setTiffin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTiffin = async () => {
      try {
        const res = await axios.get(`/api/admin/tiffins/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffin(res.data);
      } catch (err) {
        setError("Failed to fetch tiffin");
      }
    };
    fetchTiffin();
  }, [id]);

  const cancelToday = async () => {
    try {
      await axios.post(
        `/api/admin/tiffins/${id}/cancel-today`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setError("");
      alert("Today’s meals cancelled");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel");
    }
  };

  if (!tiffin) return <div className="text-white">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">{tiffin.name}</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-blue-300">Description: {tiffin.description}</p>
          <p className="text-blue-300">Base Price: ₹{tiffin.basePrice}</p>
          <p className="text-blue-300">Total Price: ₹{tiffin.totalPrice}</p>
          <p className="text-blue-300">
            Dietary Preferences: {tiffin.dietaryPrefs}
          </p>
          <p className="text-blue-300">
            Vegetarian: {tiffin.isVegetarian ? "Yes" : "No"}
          </p>
          <div className="mt-4 flex gap-4">
            <Link href={`/dashboard/admin/tiffins/${id}/daily-updates`}>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                Submit Daily Update
              </Button>
            </Link>
            <Button onClick={cancelToday} className="bg-red-500 text-white">
              Cancel Today’s Meals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
