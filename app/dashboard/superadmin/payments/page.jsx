"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function SuperadminPayments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState({
    paymentId: null,
    adminCharge: "",
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("/api/superadmin/payments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPayments(res.data);
      } catch (err) {
        setError("Failed to fetch payments");
      }
    };
    fetchPayments();
  }, []);

  const handleAction = async (paymentId, status) => {
    try {
      const data = { paymentId, status };
      if (editForm.paymentId === paymentId && editForm.adminCharge) {
        data.adminCharge = editForm.adminCharge;
      }
      await axios.patch("/api/superadmin/payments", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status, adminCharge: data.adminCharge || p.adminCharge }
            : p
        )
      );
      setEditForm({ paymentId: null, adminCharge: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update payment");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Payments</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="space-y-4">
        {payments.map((payment) => (
          <Card
            key={payment.id}
            className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <p className="text-white">
                Admin: {payment.admin.name} ({payment.admin.email})
              </p>
              <p className="text-blue-300">
                Month:{" "}
                {new Date(payment.month).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-blue-300">Amount: ₹{payment.amount}</p>
              <p className="text-blue-300">
                Admin Charge: ₹{payment.adminCharge}
              </p>
              <p className="text-blue-300">Status: {payment.status}</p>
              {payment.status === "pending" && (
                <div className="mt-4 flex gap-4 items-center">
                  {editForm.paymentId === payment.id ? (
                    <>
                      <Input
                        type="number"
                        placeholder="New Admin Charge"
                        value={editForm.adminCharge}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            adminCharge: e.target.value,
                          })
                        }
                        className="bg-slate-800 text-white border-blue-500/30"
                      />
                      <Button
                        onClick={() => handleAction(payment.id, "approved")}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          setEditForm({ paymentId: null, adminCharge: "" })
                        }
                        className="bg-red-500 text-white"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() =>
                          setEditForm({
                            paymentId: payment.id,
                            adminCharge: payment.adminCharge,
                          })
                        }
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      >
                        Edit & Approve
                      </Button>
                      <Button
                        onClick={() => handleAction(payment.id, "rejected")}
                        className="bg-red-500 text-white"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
