"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import axios from "axios";
import clsx from "clsx";

export default function EnrollmentApproval() {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const router = useRouter();

  const fetchEnrollments = useCallback(
    async (status) => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/admin/enrollments?status=${status}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEnrollments(res.data);
      } catch (err) {
        console.error("Fetch enrollments error:", err);
        setError(err.response?.data?.error || "Failed to fetch enrollments");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login?error=Session expired, please log in again");
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchEnrollments(statusFilter);
  }, [fetchEnrollments, statusFilter]);

  const handleAction = async (id, status) => {
    try {
      await axios.patch(
        `/api/admin/enrollments/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccess(
        status === "active"
          ? "Enrollment approved successfully"
          : "Enrollment rejected successfully"
      );
      setTimeout(() => setSuccess(""), 3000); // Clear success message after 3 seconds
      fetchEnrollments(statusFilter); // Refresh the list
    } catch (err) {
      console.error("Update enrollment error:", err);
      setError(
        err.response?.data?.error || "Failed to update enrollment status"
      );
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login?error=Session expired, please log in again");
      }
    }
  };

  const statuses = ["pending", "active", "cancelled"];

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-4">
        Enrollment Approval
      </h1>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded mb-4">
          {success}
        </div>
      )}
      {/* Status Tabs */}
      <div className="flex space-x-4 mb-6">
        {statuses.map((status) => (
          <button
            key={status}
            className={clsx(
              "px-4 py-2 rounded font-semibold transition",
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-blue-300 hover:bg-slate-600"
            )}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      {loading && <div className="text-blue-300">Loading...</div>}
      {!loading && enrollments.length === 0 ? (
        <p className="text-blue-300">No {statusFilter} enrollments.</p>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card
              key={enникrollment.id}
              className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
            >
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {enrollment.tiffin?.name || "Unknown Tiffin"}
                  </h3>
                  <p className="text-blue-300">
                    User: {enrollment.user?.name || "Unknown User"}
                  </p>
                  <p className="text-blue-300">
                    Start Date:{" "}
                    {new Date(enrollment.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-blue-300">Status: {enrollment.status}</p>
                </div>
                {enrollment.status === "pending" ? (
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => handleAction(enrollment.id, "active")}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(enrollment.id, "cancelled")}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="text-white font-medium">
                    {enrollment.status === "active"
                      ? "✅ Approved"
                      : "❌ Rejected"}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
