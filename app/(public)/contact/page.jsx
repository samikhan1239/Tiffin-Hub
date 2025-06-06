"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/contact", form);
      setSuccess("Message sent successfully");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to send message");
    }
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-6">Contact Us</h1>
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm max-w-md mx-auto">
        <CardContent className="p-6">
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
            <Textarea
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-slate-800 text-white border-blue-500/30"
            />
            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-green-400">{success}</p>}
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
