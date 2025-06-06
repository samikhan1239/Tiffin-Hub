"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function UserDashboard() {
  const [tiffins, setTiffins] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTiffins = async () => {
      try {
        const response = await axios.get("/api/user/tiffins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffins(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch tiffins");
      }
    };
    fetchTiffins();
  }, []);

  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">User Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiffins.length === 0 ? (
          <p className="text-blue-300">No active tiffins available.</p>
        ) : (
          tiffins.map((tiffin) => (
            <Card
              key={tiffin.id}
              className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  {tiffin.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tiffin.photo && (
                  <img
                    src={tiffin.photo}
                    alt={tiffin.name}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                )}
                <p className="text-blue-300 mb-2">{tiffin.description}</p>
                <p className="text-blue-300">Price: ₹{tiffin.totalPrice}</p>
                <p className="text-blue-300">
                  Vegetarian: {tiffin.isVegetarian ? "Yes" : "No"}
                </p>
                <p className="text-blue-300">
                  Meal Frequency: {tiffin.mealFrequency}
                </p>
                <Link href={`/dashboard/user/tiffin-details/${tiffin.id}`}>
                  <Button className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
