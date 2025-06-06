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
    if (decoded.role !== "user") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: decoded.id },
      include: {
        tiffin: {
          select: {
            id: true,
            name: true,
            photo: true,
            mealDetails: true,
          },
        },
      },
    });

    const total = enrollments.length;
    const accepted = enrollments.filter((e) => e.status === "active").length;
    const rejected = enrollments.filter((e) => e.status === "cancelled").length;
    const remaining = enrollments.filter((e) => e.status === "pending").length;

    const response = {
      total,
      accepted,
      rejected,
      remaining,
      tiffins: enrollments.map((e) => ({
        id: e.id,
        name: e.tiffin.name,
        photo: e.tiffin.photo,
        status: e.status,
        mealDetails: e.tiffin.mealDetails,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return new Response(
        JSON.stringify({ error: "Session expired, please log in again" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Fetch enrollments error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to fetch enrollments" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req) {
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

    const { tiffinId, startDate } = await req.json();
    if (!tiffinId || !startDate) {
      return new Response(
        JSON.stringify({ error: "Missing tiffinId or startDate" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: decoded.id,
        tiffinId: parseInt(tiffinId),
        startDate: new Date(startDate),
        status: "pending",
      },
    });

    return new Response(JSON.stringify(enrollment), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return new Response(
        JSON.stringify({ error: "Session expired, please log in again" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Create enrollment error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to create enrollment" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
