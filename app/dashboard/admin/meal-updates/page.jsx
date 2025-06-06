"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

export default function MealUpdates() {
  const [tiffins, setTiffins] = useState([]);
  const [selectedTiffin, setSelectedTiffin] = useState("");
  const [mealDetails, setMealDetails] = useState({
    sabjis: "",
    roti: "",
    chawal: "",
    sweet: "",
    mealType: "morning",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTiffins = async () => {
      try {
        const res = await axios.get("/api/admin/tiffins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTiffins(res.data);
        if (res.data.length > 0) setSelectedTiffin(res.data[0].id);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login?error=Session expired, please log in again");
        } else {
          setError(err.response?.data?.error || "Failed to fetch tiffins");
        }
      }
    };
    fetchTiffins();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMealDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/meal-updates",
        { tiffinId: parseInt(selectedTiffin), mealDetails },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMealDetails({
        sabjis: "",
        roti: "",
        chawal: "",
        sweet: "",
        mealType: "morning",
        date: new Date().toISOString().split("T")[0],
      });
      setSuccess("Meal update sent successfully");
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login?error=Session expired, please log in again");
      } else {
        setError(err.response?.data?.error || "Failed to send meal update");
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Send Meal Updates</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-blue-300">Select Tiffin</Label>
              <Select value={selectedTiffin} onValueChange={setSelectedTiffin}>
                <SelectTrigger className="w-[200px] bg-slate-800 text-white border-blue-500/30">
                  <SelectValue placeholder="Select tiffin" />
                </SelectTrigger>
                <SelectContent>
                  {tiffins.map((tiffin) => (
                    <SelectItem key={tiffin.id} value={tiffin.id}>
                      {tiffin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-300">Date</Label>
              <Input
                type="date"
                name="date"
                value={mealDetails.date}
                onChange={handleInputChange}
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div>
              <Label className="text-blue-300">Meal Type</Label>
              <Select
                value={mealDetails.mealType}
                onValueChange={(value) =>
                  setMealDetails((prev) => ({ ...prev, mealType: value }))
                }
              >
                <SelectTrigger className="w-[200px] bg-slate-800 text-white border-blue-500/30">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-300">Sabjis</Label>
              <Input
                name="sabjis"
                value={mealDetails.sabjis}
                onChange={handleInputChange}
                placeholder="Enter sabjis"
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div>
              <Label className="text-blue-300">Roti</Label>
              <Input
                name="roti"
                value={mealDetails.roti}
                onChange={handleInputChange}
                placeholder="Enter roti"
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div>
              <Label className="text-blue-300">Chawal</Label>
              <Input
                name="chawal"
                value={mealDetails.chawal}
                onChange={handleInputChange}
                placeholder="Enter chawal"
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div>
              <Label className="text-blue-300">Sweet</Label>
              <Input
                name="sweet"
                value={mealDetails.sweet}
                onChange={handleInputChange}
                placeholder="Enter sweet (optional)"
                className="bg-slate-800 text-white border-blue-500/30"
              />
            </div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              Send Update
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                router.push("/login");
              }}
              className="bg-gray-500 text-white"
            >
              Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
