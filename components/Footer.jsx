import { Snowflake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-slate-900/60 backdrop-blur-xl border-t border-blue-500/20 py-12 px-6">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Tiffin Hub</span>
        </div>
        <p className="text-blue-400">
          © 2025 Tiffin Hub. Delicious meals delivered fresh.
        </p>
      </div>
    </footer>
  );
}
