"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/superadmin/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  const toggleActive = async (userId, isActive) => {
    try {
      await axios.patch(
        "/api/superadmin/users",
        { userId, isActive: !isActive },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Manage Users</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="space-y-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-white">{user.name}</p>
                <p className="text-blue-300">{user.email}</p>
                <p className="text-blue-300">
                  Active: {user.isActive ? "Yes" : "No"}
                </p>
              </div>
              <Button
                onClick={() => toggleActive(user.id, user.isActive)}
                className={
                  user.isActive
                    ? "bg-red-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                }
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
