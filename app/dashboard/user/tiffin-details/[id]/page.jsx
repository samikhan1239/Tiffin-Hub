"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";

export default function TiffinDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [tiffin, setTiffin] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiffin = async () => {
      try {
        const res = await axios.get(`/api/user/tiffins/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffin(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch tiffin error:", err);
        const errorMessage =
          err.response?.data?.error || "Failed to fetch tiffin details";
        setError(errorMessage);
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login?error=Session expired, please log in again");
        }
      }
    };
    if (id) fetchTiffin();
    else {
      setError("Invalid tiffin ID");
      setLoading(false);
    }
  }, [id, router]);

  if (loading) return <div className="text-blue-300">Loading...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!tiffin) return <div className="text-red-400">Tiffin not found</div>;

  const handleEnroll = async () => {
    try {
      await axios.post(
        "/api/user/enrollments",
        { tiffinId: id, startDate: new Date().toISOString().split("T")[0] },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Enrollment request submitted, awaiting admin approval");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request enrollment");
    }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">{tiffin.name}</h1>
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {tiffin.photo ? (
                <Image
                  src={tiffin.photo}
                  alt={tiffin.name}
                  width={500}
                  height={400}
                  className="w-full rounded-lg object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-blue-300">No Image</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-blue-300 mb-4">{tiffin.description}</p>
              <p className="text-xl font-semibold text-white mb-2">
                Total Price: ₹{tiffin.totalPrice}
              </p>
              <p className="text-blue-300 mb-2">
                Meal Frequency:{" "}
                {tiffin.mealFrequency === "one-time"
                  ? "One-Time/Day"
                  : "Two-Time/Day"}
              </p>
              <p className="text-blue-300 mb-2">
                Vegetarian: {tiffin.isVegetarian ? "Yes" : "No"}
              </p>
              {tiffin.dietaryPrefs && tiffin.dietaryPrefs.length > 0 && (
                <p className="text-blue-300 mb-2">
                  Dietary Preferences:{" "}
                  {tiffin.dietaryPrefs
                    .split(",")
                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                    .join(", ")}
                </p>
              )}
              {tiffin.trialCost && (
                <p className="text-blue-300 mb-2">
                  Trial Cost: ₹{tiffin.trialCost}
                </p>
              )}
              <p className="text-blue-300 mb-2">
                Delivery Time: {tiffin.deliveryTime || "Not specified"}
              </p>
              <Button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white mt-4"
                onClick={handleEnroll}
                disabled={error}
              >
                Enroll Now
              </Button>
            </div>
          </div>
          <div className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-white">Meal Details</CardTitle>
            </CardHeader>
            <div className="text-blue-300 space-y-2">
              <p>Sabjis: {tiffin.mealDetails?.sabjis || "Not specified"}</p>
              <p>Roti: {tiffin.mealDetails?.roti || "Not specified"}</p>
              <p>Chawal: {tiffin.mealDetails?.chawal || "Not specified"}</p>
              {tiffin.mealDetails?.sweet && (
                <p>Sweet: {tiffin.mealDetails.sweet}</p>
              )}
            </div>
          </div>
          {tiffin.specialDays && tiffin.specialDays.length > 0 && (
            <div className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Special Days
                </CardTitle>
              </CardHeader>
              <ul className="text-blue-300 space-y-2">
                {tiffin.specialDays.map((day, index) => (
                  <li key={index}>
                    {day.day}: {day.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Subscription Details
              </CardTitle>
            </CardHeader>
            <div className="text-blue-300 space-y-2">
              <p>
                Minimum Subscription Days:{" "}
                {tiffin.minSubscriptionDays || "Not specified"}
              </p>
              <p>
                Cancellation Notice Period: {tiffin.cancelNoticePeriod || "0"}{" "}
                days
              </p>
              <p>
                Morning Cancellation Time:{" "}
                {tiffin.morningCancelTime || "Not specified"}
              </p>
              <p>
                Evening Cancellation Time:{" "}
                {tiffin.eveningCancelTime || "Not specified"}
              </p>
              {tiffin.maxCapacity && (
                <p>Maximum Capacity: {tiffin.maxCapacity} users</p>
              )}
              {tiffin.oneTimePrice && (
                <p>One-Time Meal Price: ₹{tiffin.oneTimePrice}/day</p>
              )}
              {tiffin.twoTimePrice && (
                <p>Two-Time Meal Price: ₹{tiffin.twoTimePrice}/day</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
