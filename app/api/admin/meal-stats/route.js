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
    const mealType = searchParams.get("mealType");

    console.log("Meal stats query params:", { tiffinId, mealType });

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

    const whereClause = {
      tiffinId: tiffinIdNum,
      tiffin: { adminId: decoded.id },
    };

    if (mealType && mealType !== "all") {
      whereClause.mealType = mealType;
    }

    const stats = await prisma.meal.groupBy({
      by: ["status"],
      where: whereClause,
      _count: { status: true },
    });

    const result = { accepted: 0, rejected: 0 };
    stats.forEach((stat) => {
      if (stat.status === "accepted") result.accepted = stat._count.status;
      if (stat.status === "rejected") result.rejected = stat._count.status;
    });

    console.log("Meal stats:", result);
    return new Response(JSON.stringify(result), {
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
    console.error("Fetch meal stats error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to fetch meal stats" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
