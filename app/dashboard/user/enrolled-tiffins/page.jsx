"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";

export default function EnrolledTiffins() {
  const [enrollments, setEnrollments] = useState({
    total: 0,
    accepted: 0,
    rejected: 0,
    remaining: 0,
    tiffins: [],
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get("/api/user/enrollments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setEnrollments(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login?error=Session expired, please log in again");
        } else {
          setError(err.response?.data?.error || "Failed to fetch enrollments");
          console.error("Failed to fetch enrollments:", err);
        }
      }
    };
    fetchEnrollments();
  }, [router]);

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Enrolled Tiffins</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-900/40 rounded-xl border border-blue-500/20 backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-white">
            {enrollments.total}
          </div>
          <div className="text-sm text-blue-300">Total Enrolled</div>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-blue-500/20 backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-white">
            {enrollments.accepted}
          </div>
          <div className="text-sm text-blue-300">Accepted</div>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-blue-500/20 backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-white">
            {enrollments.rejected}
          </div>
          <div className="text-sm text-blue-300">Rejected</div>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-blue-500/20 backdrop-blur-sm text-center">
          <div className="text-2xl font-bold text-white">
            {enrollments.remaining}
          </div>
          <div className="text-sm text-blue-300">Remaining</div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {enrollments.tiffins.map((tiffin) => (
          <Card
            key={tiffin.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <Image
                src={tiffin.photo || "/placeholder.png"}
                alt={tiffin.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white">
                {tiffin.name}
              </h3>
              <p className="text-blue-300">Status: {tiffin.status}</p>
              <div className="text-blue-300 mt-2">
                <p>Sabjis: {tiffin.mealDetails.sabjis || "N/A"}</p>
                <p>Roti: {tiffin.mealDetails.roti || "N/A"}</p>
                <p>Chawal: {tiffin.mealDetails.chawal || "N/A"}</p>
                {tiffin.mealDetails.sweet && (
                  <p>Sweet: {tiffin.mealDetails.sweet}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
