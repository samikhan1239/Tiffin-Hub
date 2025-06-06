"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelForm, setCancelForm] = useState({
    enrollmentId: null,
    date: "",
  });
  const router = useRouter();

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get("/api/user/enrollments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Handle both array and object response
      setEnrollments(res.data.tiffins || res.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login?error=Session expired, please log in again");
      } else {
        setError(err.response?.data?.error || "Failed to fetch enrollments");
      }
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [router]);

  const handleCancel = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `/api/user/enrollments/${cancelForm.enrollmentId}`,
        { date: cancelForm.date },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCancelForm({ enrollmentId: null, date: "" });
      setError("");
      setSuccess("Cancellation successful");
      await fetchEnrollments(); // Refresh enrollments
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login?error=Session expired, please log in again");
      } else {
        setError(err.response?.data?.error || "Failed to cancel");
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">My Enrollments</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}
      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <Card
            key={enrollment.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <h2 className="text-xl text-white">
                {enrollment.tiffin?.name || enrollment.name}
              </h2>
              <p className="text-blue-300">
                Start Date:{" "}
                {new Date(enrollment.startDate).toLocaleDateString()}
              </p>
              <p className="text-blue-300">Status: {enrollment.status}</p>
              <div className="text-blue-300 mt-2">
                <p>
                  Sabjis:{" "}
                  {enrollment.tiffin?.mealDetails?.sabjis ||
                    enrollment.mealDetails?.sabjis ||
                    "N/A"}
                </p>
                <p>
                  Roti:{" "}
                  {enrollment.tiffin?.mealDetails?.roti ||
                    enrollment.mealDetails?.roti ||
                    "N/A"}
                </p>
                <p>
                  Chawal:{" "}
                  {enrollment.tiffin?.mealDetails?.chawal ||
                    enrollment.mealDetails?.chawal ||
                    "N/A"}
                </p>
                {(enrollment.tiffin?.mealDetails?.sweet ||
                  enrollment.mealDetails?.sweet) && (
                  <p>
                    Sweet:{" "}
                    {enrollment.tiffin?.mealDetails?.sweet ||
                      enrollment.mealDetails?.sweet}
                  </p>
                )}
              </div>
              {enrollment.status === "active" &&
                (cancelForm.enrollmentId === enrollment.id ? (
                  <form onSubmit={handleCancel} className="mt-4 space-y-2">
                    <Input
                      type="date"
                      value={cancelForm.date}
                      onChange={(e) =>
                        setCancelForm({ ...cancelForm, date: e.target.value })
                      }
                      className="bg-slate-800 text-white border-blue-500/30"
                      required
                      min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      >
                        Confirm Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          setCancelForm({ enrollmentId: null, date: "" })
                        }
                        className="bg-red-500 text-white"
                      >
                        Close
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    onClick={() =>
                      setCancelForm({ enrollmentId: enrollment.id, date: "" })
                    }
                    className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                  >
                    Cancel for a Day
                  </Button>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
