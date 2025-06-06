import React from "react";

export default function FloatingShapesBackground() {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full animate-bounce opacity-60"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-cyan-500/25 to-sky-500/25 transform rotate-45 animate-spin opacity-50"></div>
      <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-gradient-to-r from-sky-500/15 to-blue-500/15 rounded-full animate-pulse opacity-70"></div>
      <div className="absolute bottom-60 right-1/4 w-28 h-28 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 transform rotate-12 animate-bounce opacity-65"></div>
      <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/40 to-blue-400/40 rounded-lg animate-spin opacity-55"></div>
      <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-gradient-to-r from-sky-400/35 to-cyan-400/35 transform rotate-45 animate-pulse opacity-60"></div>
      <div className="absolute bottom-1/3 left-1/2 w-18 h-18 bg-gradient-to-r from-blue-500/25 to-sky-500/25 rounded-full animate-bounce opacity-50"></div>
      <div className="absolute top-16 left-1/2 w-8 h-8 bg-cyan-400/50 rounded-full animate-ping opacity-70"></div>
      <div className="absolute top-48 left-3/4 w-6 h-6 bg-blue-400/60 transform rotate-45 animate-spin opacity-65"></div>
      <div className="absolute bottom-32 right-1/6 w-10 h-10 bg-sky-400/45 rounded-lg animate-bounce opacity-55"></div>
      <div className="absolute bottom-16 left-1/6 w-7 h-7 bg-cyan-300/55 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>
      <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent animate-pulse delay-1000"></div>
      <div className="absolute top-32 right-1/4 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-blue-400/40 animate-bounce opacity-60"></div>
      <div className="absolute bottom-48 left-1/5 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-cyan-400/50 animate-pulse opacity-55"></div>
      <div className="absolute top-1/2 left-1/6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse opacity-40"></div>
      <div className="absolute top-1/3 right-1/5 w-32 h-32 bg-cyan-500/15 rounded-full blur-xl animate-bounce opacity-35"></div>
      <div className="absolute bottom-1/4 left-3/4 w-28 h-28 bg-sky-500/18 rounded-full blur-xl animate-pulse delay-500 opacity-45"></div>
    </div>
  );
}
