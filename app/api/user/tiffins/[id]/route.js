import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: No token provided" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "user") {
      return new Response(
        JSON.stringify({ error: "Forbidden: User role required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const tiffin = await prisma.tiffin.findUnique({
      where: { id: parseInt(params.id), isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        totalPrice: true,
        photo: true,
        isVegetarian: true,
        mealFrequency: true,
        mealDetails: true,
        specialDays: true,
        dietaryPrefs: true,
        trialCost: true,
        deliveryTime: true,
        morningCancelTime: true,
        eveningCancelTime: true,
        minSubscriptionDays: true,
        cancelNoticePeriod: true,
        maxCapacity: true,
        oneTimePrice: true,
        twoTimePrice: true,
      },
    });

    if (!tiffin) {
      return new Response(
        JSON.stringify({ error: "Tiffin not found or not active" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(tiffin), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return new Response(
        JSON.stringify({ error: "Session expired, please log in again" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.error("Get tiffin details error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: "Failed to fetch tiffin" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
