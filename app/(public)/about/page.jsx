import { Card, CardContent } from "@/components/ui/card";
import { Snowflake } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-6">About Tiffin Hub</h1>
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Snowflake className="w-8 h-8 text-blue-300" />
            <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
          </div>
          <p className="text-blue-300 mb-4">
            Tiffin Hub is dedicated to delivering fresh, delicious, and healthy
            meals right to your doorstep. Our platform connects users with local
            tiffin service providers, ensuring quality and convenience.
          </p>
          <p className="text-blue-300">
            With a focus on transparency and reliability, we empower admins to
            manage their tiffin services efficiently while providing users with
            real-time updates and seamless enrollment processes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
