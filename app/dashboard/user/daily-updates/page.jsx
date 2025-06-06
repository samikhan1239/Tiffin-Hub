"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import io from "socket.io-client";

export default function DailyUpdates() {
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setError("");
        const res = await axios.get("/api/user/daily-updates", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("API Response:", res.data); // Debug log
        setUpdates(res.data);
      } catch (err) {
        console.error(
          "Failed to fetch updates:",
          err.response?.status,
          err.response?.data,
          err.message
        );
        if (
          err.response?.status === 401 &&
          err.response?.data?.error.includes("Token expired")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login");
        } else {
          setError(err.response?.data?.error || "Failed to load updates");
        }
      }
    };
    fetchUpdates();

    const socket = io();
    socket.on("mealUpdate", (update) => {
      console.log("Socket.IO mealUpdate:", update); // Debug log
      setUpdates((prev) => {
        // Avoid duplicates
        if (prev.some((u) => u.id === update.id)) return prev;
        return [update, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleAction = async (id, action) => {
    try {
      setError("");
      await axios.post(
        "/api/user/accept-reject",
        { id, action },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUpdates((prev) =>
        prev.map((update) =>
          update.id === id ? { ...update, status: action } : update
        )
      );
    } catch (err) {
      console.error(
        "Failed to process action:",
        err.response?.status,
        err.response?.data,
        err.message
      );
      if (
        err.response?.status === 401 &&
        err.response?.data?.error.includes("Token expired")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
      } else {
        setError(err.response?.data?.error || "Failed to process action");
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Daily Updates</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {updates.length === 0 && !error && (
        <p className="text-blue-300 mb-4">No updates available</p>
      )}
      {updates.length > 0 && (
        <p className="text-blue-300 mb-4">{updates.length} update(s) found</p>
      )}
      <div className="space-y-4">
        {updates.map((update) => (
          <Card
            key={update.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white">
                {update.tiffin?.name || "Unknown Tiffin"}
              </h3>
              <p className="text-blue-300">
                Sabjis: {update.sabjis || "N/A"}, Roti: {update.roti || "N/A"},
                Chawal: {update.chawal || "N/A"}, Sweet:{" "}
                {update.sweet || "None"}
              </p>
              <p className="text-blue-300">
                Date: {new Date(update.date).toLocaleDateString()}
              </p>
              <p className="text-blue-300">Status: {update.status}</p>
              {update.status === "pending" && (
                <div className="mt-4 flex space-x-4">
                  <Button
                    onClick={() => handleAction(update.id, "accepted")}
                    className="bg-green-500 text-white"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleAction(update.id, "rejected")}
                    className="bg-red-500 text-white"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
