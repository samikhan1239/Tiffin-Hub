"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryPlace: "",
    photo: null,
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setForm(res.data);
      } catch (err) {
        setError("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    try {
      await axios.put("/api/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/dashboard/user");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleFileChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-lg border border-blue-500/20">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-slate-800 text-white border-blue-500/30"
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-slate-800 text-white border-blue-500/30"
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="bg-slate-800 text-white border-blue-500/30"
          />
          {form.role === "user" && (
            <Input
              placeholder="Delivery Place"
              value={form.deliveryPlace}
              onChange={(e) =>
                setForm({ ...form, deliveryPlace: e.target.value })
              }
              className="bg-slate-800 text-white border-blue-500/30"
            />
          )}
          {form.role === "admin" && (
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-slate-800 text-white border-blue-500/30"
            />
          )}
          {error && <p className="text-red-400">{error}</p>}
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
