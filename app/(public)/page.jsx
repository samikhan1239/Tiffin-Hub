"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    deliveryPlace: "",
    photo: null,
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    try {
      await axios.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  const handleFileChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  return (
    <div className="container mx-auto px-6 py-20 relative z-10">
      <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-xl p-8 rounded-lg border border-blue-500/20">
        <h1 className="text-2xl font-bold text-white mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-slate-800 text-white border-blue-500/30"
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-slate-800 text-white border-blue-500/30"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-slate-800 text-white border-blue-500/30"
            required
          />
          <Input
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="bg-slate-800 text-white border-blue-500/30"
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full p-2 bg-slate-800 text-white border border-blue-500/30 rounded"
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {form.role === "user" && (
            <Input
              placeholder="Delivery Place"
              value={form.deliveryPlace}
              onChange={(e) =>
                setForm({ ...form, deliveryPlace: e.target.value })
              }
              className="bg-slate-800 text-white border-blue-500/30"
              required
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
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            Register
          </Button>
        </form>
        <p className="text-blue-300 mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-blue-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
