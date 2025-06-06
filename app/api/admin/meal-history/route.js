import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const tiffinId = searchParams.get("tiffinId");
    const mealType = searchParams.get("mealType");

    if (!tiffinId) {
      return new Response(JSON.stringify({ error: "Missing tiffinId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const whereClause = {
      tiffinId: parseInt(tiffinId),
      tiffin: { adminId: decoded.id }, // Ensure admin owns the tiffin
    };

    if (userId && userId !== "all") {
      whereClause.userId = parseInt(userId);
    }

    if (mealType && mealType !== "all") {
      whereClause.mealType = mealType;
    }

    const meals = await prisma.meal.findMany({
      where: whereClause,
      include: {
        tiffin: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    return new Response(JSON.stringify(meals), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return new Response(
        JSON.stringify({ error: "Session expired, please log in again" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.error("Fetch meal history error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to fetch meal history" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
