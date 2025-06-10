"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import Image from "next/image";

export default function AddTiffin() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    superadminSurplus: "100",
    totalPrice: "0",
    mealFrequency: "one-time",
    oneTimePrice: "",
    twoTimePrice: "",
    mealDetails: { sabjis: "", roti: "", chawal: "", sweet: "" },
    specialDays: [{ day: "", description: "" }],
    specialDaysCount: "0",
    trialCost: "",
    photo: null,
    isVegetarian: true,
    dietaryPrefs: [],
    deliveryTime: "",
    morningCancelTime: "",
    eveningCancelTime: "",
    minSubscriptionDays: "",
    cancelNoticePeriod: "",
    maxCapacity: "",
  });
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Calculate total price (basePrice + superadminSurplus)
  useEffect(() => {
    const base = parseFloat(form.basePrice) || 0;
    const surplus = parseFloat(form.superadminSurplus) || 0;
    setForm((prev) => ({
      ...prev,
      totalPrice: (base + surplus).toFixed(2),
    }));
  }, [form.basePrice, form.superadminSurplus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus("uploading");
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (
        key === "specialDays" ||
        key === "mealDetails" ||
        key === "dietaryPrefs"
      ) {
        formData.append(key, JSON.stringify(value));
      } else if (key === "photo") {
        if (value) formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      await axios.post("/api/admin/tiffins", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus("uploaded");
      router.push("/dashboard/admin/tiffins");
    } catch (err) {
      setUploadStatus("");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login?error=Session expired, please log in again");
      } else {
        setError(err.response?.data?.error || "Failed to add tiffin");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, photo: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUploadStatus("");
    } else {
      setPreview(null);
      setUploadStatus("");
    }
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

  const handleDietaryPrefChange = (pref) => {
    setForm((prev) => ({
      ...prev,
      dietaryPrefs: prev.dietaryPrefs.includes(pref)
        ? prev.dietaryPrefs.filter((p) => p !== pref)
        : [...prev.dietaryPrefs, pref],
    }));
  };

  return (
    <div className="container mx-auto px-6 py-6 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-6">Add New Tiffin</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="text-blue-300">Superadmin Surplus (₹)</label>
                <Input
                  type="number"
                  value={form.superadminSurplus}
                  readOnly
                  className="bg-slate-800 text-white border-blue-500/30"
                />
              </div>
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
              <div className="space-y-2">
                <Input
                  placeholder="Sabjis (e.g., Paneer Butter Masala)"
                  value={form.mealDetails.sabjis}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mealDetails: {
                        ...form.mealDetails,
                        sabjis: e.target.value,
                      },
                    })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  required
                />
                <Input
                  placeholder="Roti (e.g., Naan, Tandoori Roti)"
                  value={form.mealDetails.roti}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mealDetails: {
                        ...form.mealDetails,
                        roti: e.target.value,
                      },
                    })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  required
                />
                <Input
                  placeholder="Chawal (e.g., Jeera Rice, Pulao)"
                  value={form.mealDetails.chawal}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mealDetails: {
                        ...form.mealDetails,
                        chawal: e.target.value,
                      },
                    })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  required
                />
                <Input
                  placeholder="Sweet (e.g., Gulab Jamun)"
                  value={form.mealDetails.sweet}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mealDetails: {
                        ...form.mealDetails,
                        sweet: e.target.value,
                      },
                    })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                />
              </div>
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
              <label className="text-blue-300">Tiffin Photo</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-slate-800 text-white border-blue-500/30"
              />
              {preview && (
                <Image
                  src={preview}
                  alt="Tiffin Preview"
                  className="mt-2 max-w-xs rounded"
                  width={400} // You can adjust this
                  height={300} // You can adjust this
                />
              )}
              {uploadStatus === "uploading" && (
                <p className="text-blue-300 mt-2">Uploading...</p>
              )}
              {uploadStatus === "uploaded" && (
                <p className="text-green-300 mt-2">Uploaded!</p>
              )}
            </div>
            <div>
              <label className="text-blue-300">Dietary Preferences</label>
              <div className="flex gap-4">
                {["vegan", "gluten-free", "jain", "low-carb"].map((pref) => (
                  <label key={pref} className="text-white">
                    <input
                      type="checkbox"
                      checked={form.dietaryPrefs.includes(pref)}
                      onChange={() => handleDietaryPrefChange(pref)}
                    />{" "}
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-blue-300">Vegetarian</label>
              <select
                value={form.isVegetarian}
                onChange={(e) =>
                  setForm({ ...form, isVegetarian: e.target.value === "true" })
                }
                className="w-full p-2 bg-slate-800 text-white border border-blue-500/30 rounded"
                required
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-blue-300">
                  Morning Cancellation Time
                </label>
                <Input
                  type="time"
                  value={form.morningCancelTime}
                  onChange={(e) =>
                    setForm({ ...form, morningCancelTime: e.target.value })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  required
                />
              </div>
              <div>
                <label className="text-blue-300">
                  Evening Cancellation Time
                </label>
                <Input
                  type="time"
                  value={form.eveningCancelTime}
                  onChange={(e) =>
                    setForm({ ...form, eveningCancelTime: e.target.value })
                  }
                  className="bg-slate-800 text-white border-blue-500/30"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-blue-300">Minimum Subscription Days</label>
              <Input
                type="number"
                placeholder="e.g., 7"
                value={form.minSubscriptionDays}
                onChange={(e) =>
                  setForm({ ...form, minSubscriptionDays: e.target.value })
                }
                className="bg-slate-800 text-white border-blue-500/30"
                min="1"
                required
              />
            </div>
            <div>
              <label className="text-blue-300">
                Cancellation Notice Period (Days)
              </label>
              <Input
                type="number"
                placeholder="e.g., 2"
                value={form.cancelNoticePeriod}
                onChange={(e) =>
                  setForm({ ...form, cancelNoticePeriod: e.target.value })
                }
                className="bg-slate-800 text-white border-blue-500/30"
                min="0"
                required
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
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              disabled={uploadStatus === "uploading"}
            >
              Add Tiffin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
