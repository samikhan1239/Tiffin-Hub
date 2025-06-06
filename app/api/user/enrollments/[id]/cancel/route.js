import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req, { params }) {
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

    const { id } = params;
    const { date } = await req.json();
    if (!date) {
      return new Response(JSON.stringify({ error: "Missing date" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id), userId: decoded.id, status: "active" },
      include: { tiffin: true },
    });
    if (!enrollment) {
      return new Response(
        JSON.stringify({ error: "Enrollment not found or unauthorized" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const cancelDate = new Date(date);
    const now = new Date();
    const morningCancelTime = new Date(
      `${date}T${enrollment.tiffin.morningCancelTime}`
    );
    const eveningCancelTime = new Date(
      `${date}T${enrollment.tiffin.eveningCancelTime}`
    );

    if (now > morningCancelTime && now > eveningCancelTime) {
      return new Response(
        JSON.stringify({ error: "Cancellation deadline passed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const dailyUpdate = await prisma.dailyUpdate.upsert({
      where: {
        tiffinId_date: { tiffinId: enrollment.tiffinId, date: cancelDate },
      },
      update: { status: "cancelled", userId: decoded.id },
      create: {
        tiffinId: enrollment.tiffinId,
        userId: decoded.id,
        date: cancelDate,
        mealDetails: enrollment.tiffin.mealDetails,
        status: "cancelled",
      },
    });

    await prisma.notification.create({
      data: {
        userId: decoded.id,
        dailyUpdateId: dailyUpdate.id,
        message: `You cancelled meals for ${
          enrollment.tiffin.name
        } on ${cancelDate.toLocaleDateString()}`,
        status: "sent",
      },
    });

    return new Response(JSON.stringify(dailyUpdate), {
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
    console.error("Cancel enrollment error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to cancel enrollment" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
