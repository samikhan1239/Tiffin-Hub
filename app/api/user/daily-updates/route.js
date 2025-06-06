import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Adjust for production
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}

export async function GET(req) {
  console.log("Request method:", req.method); // Debug log
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "user") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const meals = await prisma.meal.findMany({
      where: {
        userId: decoded.id,
        tiffin: {
          enrollments: {
            some: {
              userId: decoded.id,
              status: "active",
            },
          },
        },
      },
      include: {
        tiffin: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    const formattedMeals = meals.map((meal) => ({
      id: meal.id,
      tiffin: meal.tiffin,
      sabjis: meal.sabjis,
      roti: meal.roti,
      chawal: meal.chawal,
      sweet: meal.sweet,
      date: meal.date,
      status: meal.status,
    }));

    return new Response(JSON.stringify(formattedMeals), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Adjust for production
      },
    });
  } catch (error) {
    console.error("Get daily updates error:", error.message, error.stack);
    if (error.name === "TokenExpiredError") {
      return new Response(
        JSON.stringify({ error: "Token expired, please login again" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "Failed to fetch daily updates" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
