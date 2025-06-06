"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNotifications(res.data);
      } catch (err) {
        setError("Failed to fetch notifications");
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        "/api/notifications",
        { notificationId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read" } : n
        )
      );
    } catch (err) {
      setError("Failed to mark as read");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Notifications</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-white">{notification.message}</p>
                <p className="text-blue-300 text-sm">
                  {notification.dailyUpdate?.tiffin?.name} -{" "}
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
                <p className="text-blue-300 text-sm">
                  Status: {notification.status}
                </p>
              </div>
              {notification.status === "sent" && (
                <Button
                  onClick={() => markAsRead(notification.id)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                >
                  Mark as Read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
