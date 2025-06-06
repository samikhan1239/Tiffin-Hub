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
    const tiffinId = searchParams.get("tiffinId");

    console.log("Next meal query params:", { tiffinId });

    if (!tiffinId) {
      return new Response(JSON.stringify({ error: "Missing tiffinId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tiffinIdNum = parseInt(tiffinId);
    if (isNaN(tiffinIdNum)) {
      return new Response(JSON.stringify({ error: "Invalid tiffinId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const nextMeal = await prisma.meal.findFirst({
      where: {
        tiffinId: tiffinIdNum,
        tiffin: { adminId: decoded.id },
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        mealType: true,
        sabjis: true,
        roti: true,
        chawal: true,
        sweet: true,
        status: true,
      },
    });

    console.log("Next meal:", nextMeal || "None");
    return new Response(JSON.stringify(nextMeal), {
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
    } else if (error.name === "JsonWebTokenError") {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Fetch next meal error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to fetch next meal" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
