"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function EditTiffin() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    superadminSurcharge: "200",
    totalPrice: "0",
    mealFrequency: "one-time",
    oneTimePrice: "",
    twoTimePrice: "",
    mealDetails: "",
    specialDays: [{ day: "", description: "" }],
    specialDaysCount: "0",
    trialCost: "",
    photo: null,
    isVegetarian: true,
    deliveryTime: "",
    maxCapacity: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchTiffin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/admin/tiffins/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tiffin = res.data;
        setForm({
          name: tiffin.name,
          description: tiffin.description,
          basePrice: tiffin.basePrice.toString(),
          superadminSurcharge: tiffin.superadminSurcharge.toString(),
          totalPrice: tiffin.totalPrice.toString(),
          mealFrequency: tiffin.mealFrequency,
          oneTimePrice: tiffin.oneTimePrice?.toString() || "",
          twoTimePrice: tiffin.twoTimePrice?.toString() || "",
          mealDetails: tiffin.mealDetails,
          specialDays: tiffin.specialDays.length
            ? tiffin.specialDays
            : [{ day: "", description: "" }],
          specialDaysCount: tiffin.specialDaysCount.toString(),
          trialCost: tiffin.trialCost?.toString() || "",
          photo: null,
          isVegetarian: tiffin.isVegetarian,
          deliveryTime: tiffin.deliveryTime || "",
          maxCapacity: tiffin.maxCapacity?.toString() || "",
        });
      } catch (err) {
        setError("Failed to load tiffin data");
      }
    };
    fetchTiffin();
  }, [id]);

  useEffect(() => {
    const base = parseFloat(form.basePrice) || 0;
    const surcharge = parseFloat(form.superadminSurcharge) || 0;
    setForm((prev) => ({ ...prev, totalPrice: (base + surcharge).toFixed(2) }));
  }, [form.basePrice, form.superadminSurcharge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "specialDays") {
        formData.append(key, JSON.stringify(value));
      } else if (key === "photo") {
        if (value) formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      await axios.put(`/api/admin/tiffins/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/dashboard/admin/tiffins");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update tiffin");
    }
  };

  const handleFileChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleSpecialDayChange = (index, field, value) => {
    const newSpecialDays = [...form.specialDays];
    newSpecialDays[index][field] = value;
    setForm({
      ...form,
      specialDays: newSpecialDays,
      specialDaysCount: newSpecialDays.length.toString(),
    });
  };

  const addSpecialDay = () => {
    setForm({
      ...form,
      specialDays: [...form.specialDays, { day: "", description: "" }],
    });
  };

  const removeSpecialDay = (index) => {
    const newSpecialDays = form.specialDays.filter((_, i) => i !== index);
    setForm({
      ...form,
      specialDays: newSpecialDays,
      specialDaysCount: newSpecialDays.length.toString(),
    });
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Edit Tiffin</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-blue-300">Tiffin Name</label>
              <Input
                placeholder="e.g., Veggie Delight"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div>
              <label className="text-blue-300">Description</label>
              <Textarea
                placeholder="Describe the tiffin"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-blue-300">Base Price (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g., 3000"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm({ ...form, basePrice: e.target.value })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="text-blue-300">
                  Superadmin Surcharge (₹)
                </label>
                <Input
                  type="number"
                  value={form.superadminSurcharge}
                  onChange={(e) =>
                    setForm({ ...form, superadminSurcharge: e.target.value })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="text-blue-300">Total Price (₹)</label>
                <Input
                  type="text"
                  value={form.totalPrice}
                  readOnly
                  className="bg-slate-800 text-white border-blue-500/30"
                />
              </div>
            </div>
            <div>
              <label className="text-blue-300">Meal Frequency</label>
              <select
                value={form.mealFrequency}
                onChange={(e) =>
                  setForm({ ...form, mealFrequency: e.target.value })
                }
                className="w-full p-2 bg-slate-800 text-white border border-blue-500/30 rounded"
                required
              >
                <option value="one-time">One-Time/Day</option>
                <option value="two-time">Two-Time/Day</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-blue-300">
                  One-Time Meal Price/Day (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={form.oneTimePrice}
                  onChange={(e) =>
                    setForm({ ...form, oneTimePrice: e.target.value })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  min="0"
                />
              </div>
              <div>
                <label className="text-blue-300">
                  Two-Time Meal Price/Day (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 180"
                  value={form.twoTimePrice}
                  onChange={(e) =>
                    setForm({ ...form, twoTimePrice: e.target.value })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="text-blue-300">Meal Details</label>
              <Textarea
                placeholder="e.g., Dal, Rice, Sabzi, Roti"
                value={form.mealDetails}
                onChange={(e) =>
                  setForm({ ...form, mealDetails: e.target.value })
                }
                className="bg-slate-800 text-white border-blue-500/30"
                required
              />
            </div>
            <div>
              <label className="text-blue-300">Special Days</label>
              {form.specialDays.map((specialDay, index) => (
                <div key={index} className="flex gap-4 mb-2 items-center">
                  <Input
                    placeholder="Day (e.g., Sunday)"
                    value={specialDay.day}
                    onChange={(e) =>
                      handleSpecialDayChange(index, "day", e.target.value)
                    }
                    className="bg-slate-800 text-white border-blue-500/30"
                  />
                  <Input
                    placeholder="Description (e.g., Biryani Day)"
                    value={specialDay.description}
                    onChange={(e) =>
                      handleSpecialDayChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    className="bg-slate-800 text-white border-blue-500/30"
                  />
                  <Button
                    type="button"
                    onClick={() => removeSpecialDay(index)}
                    className="bg-red-500 text-white"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={addSpecialDay}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white mt-2"
              >
                Add Special Day
              </Button>
            </div>
            <div>
              <label className="text-blue-300">Number of Special Days</label>
              <Input
                type="number"
                value={form.specialDaysCount}
                readOnly
                className="bg-slate-800 text-white border-blue-500/30"
              />
            </div>
            <div>
              <label className="text-blue-300">Trial Tiffin Cost (₹)</label>
              <Input
                type="number"
                placeholder="e.g., 150"
                value={form.trialCost}
                onChange={(e) =>
                  setForm({ ...form, trialCost: e.target.value })
                }
                className="bg-slate-800 text-white border-blue-500/30"
                min="0"
              />
            </div>
            <div>
              <label className="text-blue-300">Admin Photo</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-slate-800 text-white border-blue-500/30"
              />
            </div>
            <div>
              <label className="text-blue-300">Vegetarian</label>
              <select
                value={form.isVegetarian}
                onChange={(e) =>
                  setForm({ ...form, isVegetarian: e.target.value === "true" })
                }
                className="w-full p-2 bg-slate-800 text-white border border-blue-500/30 rounded"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="text-blue-300">Delivery Time</label>
              <Input
                placeholder="e.g., 12:00 PM - 2:00 PM"
                value={form.deliveryTime}
                onChange={(e) =>
                  setForm({ ...form, deliveryTime: e.target.value })
                }
                className="bg-slate-800 text-white border-blue-500/30"
              />
            </div>
            <div>
              <label className="text-blue-300">
                Maximum Enrollment Capacity
              </label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={form.maxCapacity}
                onChange={(e) =>
                  setForm({ ...form, maxCapacity: e.target.value })
                }
                className="bg-slate-800 text-white border-blue-500/30"
                min="0"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              Update Tiffin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
