import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

    const { id, action } = await req.json();
    if (!id || !["accepted", "rejected"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid meal ID or action" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const meal = await prisma.meal.findUnique({
      where: { id: parseInt(id), userId: decoded.id, status: "pending" },
      include: { tiffin: { select: { mealFrequency: true, name: true } } }, // Include tiffin relation
    });

    if (!meal) {
      return new Response(
        JSON.stringify({ error: "Meal not found or not pending" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const updatedMeal = await prisma.meal.update({
      where: { id: parseInt(id) },
      data: { status: action },
    });

    // Decrease tiffinCount if accepted
    if (action === "accepted") {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: decoded.id,
          tiffinId: meal.tiffinId,
          status: "active",
        },
      });

      if (enrollment) {
        const decrement = meal.tiffin.mealFrequency === "one-time" ? 1 : 2;
        const newTiffinCount = Math.max(0, enrollment.tiffinCount - decrement);

        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { tiffinCount: newTiffinCount },
        });

        // Create notification for meal acceptance
        await prisma.notification.create({
          data: {
            userId: decoded.id,
            mealId: meal.id, // Changed from dailyUpdateId
            message: `You accepted the meal for ${
              meal.tiffin.name
            } on ${new Date(meal.date).toLocaleDateString()}`,
            status: "sent",
          },
        });

        // Deactivate if tiffinCount <= 0
        if (newTiffinCount <= 0) {
          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { status: "deactivated", endDate: new Date() },
          });

          await prisma.notification.create({
            data: {
              userId: decoded.id,
              mealId: null, // Non-meal notification
              message: `Your enrollment for ${meal.tiffin.name} has been deactivated due to no remaining meals`,
              status: "sent",
            },
          });
        }
      }
    }

    return new Response(JSON.stringify(updatedMeal), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Accept/reject meal error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: "Failed to process action" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
