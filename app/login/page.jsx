"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Link from "next/link";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", form);
      const token = res.data.token;
      const role = res.data.user.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Redirect based on role
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "user") {
        router.push("/dashboard/user");
      } else if (role === "superadmin") {
        router.push("/dashboard/superadmin");
      } else {
        router.push("/dashboard"); // fallback
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 relative z-10">
      <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-xl p-8 rounded-lg border border-blue-500/20">
        <h1 className="text-2xl font-bold text-white mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {error && <p className="text-red-400">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            Sign In
          </Button>
        </form>
        <p className="text-blue-300 mt-4 text-center">
          Don &apos;t have an account?{" "}
          <Link href="/register" className="underline hover:text-blue-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
