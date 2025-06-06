"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending"); // 'pending' or 'approved'

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching admins with token:", token);

        const res = await axios.get("/api/superadmin/admins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched admins:", res.data);
        setAdmins(res.data);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      }
    };

    fetchAdmins();
  }, []);

  const handleApprove = async (adminId) => {
    try {
      const token = localStorage.getItem("token");
      setLoadingId(adminId);
      console.log("Approving admin:", adminId);

      const res = await axios.patch(
        "/api/superadmin/admins",
        { adminId, isApproved: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Approval response:", res.data);

      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === adminId ? { ...admin, isApproved: true } : admin
        )
      );

      setMessage(`✅ Admin ${res.data.name} approved successfully.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to approve admin:", err);
      setMessage("❌ Failed to approve admin. Try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredAdmins =
    filter === "approved"
      ? admins.filter((admin) => admin.isApproved)
      : admins.filter((admin) => !admin.isApproved);

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Management</h1>

      {message && (
        <div className="mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded shadow">
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            filter === "pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded ${
            filter === "approved"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setFilter("approved")}
        >
          Approved
        </button>
      </div>

      {/* Admin Cards */}
      <div className="space-y-4">
        {filteredAdmins.length === 0 ? (
          <p className="text-gray-400">No {filter} admins found.</p>
        ) : (
          filteredAdmins.map((admin) => (
            <Card
              key={admin.id}
              className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
            >
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {admin.name}
                  </h3>
                  <p className="text-blue-300">{admin.email}</p>
                  <p className="text-blue-300">{admin.phone}</p>
                  <p
                    className={`mt-1 font-semibold ${
                      admin.isApproved ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    Status:{" "}
                    {admin.isApproved ? "✅ Approved" : "⏳ Pending Approval"}
                  </p>
                </div>

                {!admin.isApproved && (
                  <Button
                    onClick={() => handleApprove(admin.id)}
                    disabled={loadingId === admin.id}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  >
                    {loadingId === admin.id ? "Approving..." : "Approve"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
