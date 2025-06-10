"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Snowflake, Wind, ArrowRight } from "lucide-react";

export default function IceBlueLayout2V1() {
  const featuredTiffins = [
    {
      id: 1,
      name: "Arctic Gujarati Delight",
      chef: "Chef Frost Sharma",
      image: "/p6.jpg",
      rating: 4.9,
      price: "₹149",
      deliveryTime: "25-35 min",
    },
    {
      id: 2,
      name: "Glacier South Special",
      chef: "Chef Ice Iyer",
      image: "/p7.jpg",
      rating: 4.8,
      price: "₹129",
      deliveryTime: "30-40 min",
    },
    {
      id: 3,
      name: "Frozen Punjabi Feast",
      chef: "Chef Crystal Singh",
      image: "/p8.jpg",
      rating: 4.9,
      price: "₹159",
      deliveryTime: "20-30 min",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 relative overflow-hidden w-full max-w-full ">
      {/* Background V1: Floating Geometric Shapes */}
      <div className="absolute inset-0">
        {/* Large Floating Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-cyan-500/25 to-sky-500/25 transform rotate-45 animate-spin opacity-50"></div>
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-gradient-to-r from-sky-500/15 to-blue-500/15 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute bottom-60 right-1/4 w-28 h-28 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 transform rotate-12 animate-bounce opacity-65"></div>

        {/* Medium Floating Elements */}
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/40 to-blue-400/40 rounded-lg animate-spin opacity-55"></div>
        <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-gradient-to-r from-sky-400/35 to-cyan-400/35 transform rotate-45 animate-pulse opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/2 w-18 h-18 bg-gradient-to-r from-blue-500/25 to-sky-500/25 rounded-full animate-bounce opacity-50"></div>

        {/* Small Floating Particles */}
        <div className="absolute top-16 left-1/2 w-8 h-8 bg-cyan-400/50 rounded-full animate-ping opacity-70"></div>
        <div className="absolute top-48 left-3/4 w-6 h-6 bg-blue-400/60 transform rotate-45 animate-spin opacity-65"></div>
        <div className="absolute bottom-32 right-1/6 w-10 h-10 bg-sky-400/45 rounded-lg animate-bounce opacity-55"></div>
        <div className="absolute bottom-16 left-1/6 w-7 h-7 bg-cyan-300/55 rounded-full animate-pulse opacity-60"></div>

        {/* Animated Lines */}
        <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>
        <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent animate-pulse delay-1000"></div>

        {/* Floating Triangles */}
        <div className="absolute top-32 right-1/4 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-blue-400/40 animate-bounce opacity-60"></div>
        <div className="absolute bottom-48 left-1/5 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-cyan-400/50 animate-pulse opacity-55"></div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/2 left-1/6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse opacity-40"></div>
        <div className="absolute top-1/3 right-1/5 w-32 h-32 bg-cyan-500/15 rounded-full blur-xl animate-bounce opacity-35"></div>
        <div className="absolute bottom-1/4 left-3/4 w-28 h-28 bg-sky-500/18 rounded-full blur-xl animate-pulse delay-500 opacity-45"></div>
      </div>

      {/* Asymmetric Hero Layout */}
      <section className="relative z-10 py-10 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Arctic Fresh
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Floating Delivery
                </span>
              </h1>

              <p className="text-lg text-blue-200 mb-8 max-w-lg">
                Experience the mesmerizing dance of floating geometric shapes
                that represent our arctic-fresh delivery system in motion.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4"
                >
                  Float with Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-300 hover:bg-blue-500/10 px-8 py-4"
                >
                  Explore Menu
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-900/40 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">50K+</div>
                  <div className="text-sm text-blue-300">Floating Orders</div>
                </div>
                <div className="text-center p-4 bg-slate-900/40 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">4.9★</div>
                  <div className="text-sm text-blue-300">Shape Rating</div>
                </div>
                <div className="text-center p-4 bg-slate-900/40 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">
                    25min
                  </div>
                  <div className="text-sm text-blue-300">Float Time</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 backdrop-blur-sm border border-blue-500/20">
                  <Image
                    src="/p5.jpg"
                    alt="Floating Shapes Tiffin"
                    width={500}
                    height={400}
                    className="rounded-2xl w-full"
                  />
                </div>

                <div className="absolute -top-6 -right-6 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">◯</div>
                    <div className="text-blue-300 text-sm">Floating Fresh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Floating Collection
            </h2>
            <p className="text-blue-300">
              Meals that dance with geometric precision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredTiffins.map((tiffin) => (
              <Card
                key={tiffin.id}
                className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm hover:bg-slate-900/60 transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={tiffin.image}
                    alt={tiffin.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    Floating Fresh
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {tiffin.name}
                      </h3>
                      <p className="text-blue-300 text-sm">{tiffin.chef}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm text-blue-300">
                        {tiffin.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-white">
                      {tiffin.price}
                    </span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    >
                      Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
