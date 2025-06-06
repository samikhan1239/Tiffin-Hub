"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function DailyUpdates() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    mealDetails: { breakfast: "", lunch: "", dinner: "" },
  });
  const [error, setError] = useState("");
  const [tiffin, setTiffin] = useState(null);

  useEffect(() => {
    const fetchTiffin = async () => {
      try {
        const res = await axios.get(`/api/admin/tiffins/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffin(res.data);
        setForm((prev) => ({ ...prev, mealDetails: res.data.mealDetails }));
      } catch (err) {
        setError("Failed to fetch tiffin");
      }
    };
    fetchTiffin();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/daily-updates",
        { tiffinId: id, ...form },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      router.push(`/dashboard/admin/tiffins/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit update");
    }
  };

  if (!tiffin) return <div className="text-white">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">
        Daily Update for {tiffin.name}
      </h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-blue-300">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div>
              <label className="text-blue-300">Meal Details</label>
              <Input
                placeholder="Breakfast"
                value={form.mealDetails.breakfast}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mealDetails: {
                      ...form.mealDetails,
                      breakfast: e.target.value,
                    },
                  })
                }
                className="bg-slate-800 text-white border-blue-500/30 mb-2"
              />
              <Input
                placeholder="Lunch"
                value={form.mealDetails.lunch}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mealDetails: { ...form.mealDetails, lunch: e.target.value },
                  })
                }
                className="bg-slate-800 text-white border-blue-500/30 mb-2"
                required
              />
              <Input
                placeholder="Dinner"
                value={form.mealDetails.dinner}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mealDetails: {
                      ...form.mealDetails,
                      dinner: e.target.value,
                    },
                  })
                }
                className="bg-slate-800 text-white border-blue-500/30"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              Submit Update
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
