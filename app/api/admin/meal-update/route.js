import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { sendMealUpdateEmail } from "@/lib/email";
import { initWebSocket } from "@/lib/websocket";

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
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      tiffinId,
      mealDetails,
      date = new Date().toISOString().split("T")[0],
    } = await req.json();
    if (
      !tiffinId ||
      !mealDetails ||
      !mealDetails.sabji ||
      !mealDetails.roti ||
      !mealDetails.chawal ||
      !mealDetails.dal
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing tiffinId or required mealDetails fields",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify tiffin exists and belongs to the admin
    const tiffin = await prisma.tiffin.findUnique({
      where: { id: parseInt(tiffinId), adminId: decoded.id },
    });
    if (!tiffin) {
      return new Response(
        JSON.stringify({ error: "Tiffin not found or unauthorized" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { tiffinId: parseInt(tiffinId), status: "active" },
      include: { user: { select: { id: true, email: true } } },
    });

    const updates = await Promise.all(
      enrollments.map(async (enrollment) => {
        const update = await prisma.dailyUpdate.create({
          data: {
            tiffinId: parseInt(tiffinId),
            userId: enrollment.userId,
            date: new Date(date),
            mealDetails: {
              sabji: mealDetails.sabji,
              roti: mealDetails.roti,
              chawal: mealDetails.chawal,
              dal: mealDetails.dal,
              additional: mealDetails.additional || null,
            },
            status: "pending",
          },
        });

        // Send email notification
        await sendMealUpdateEmail(
          enrollment.user.email,
          `${tiffin.name} Meal Update for ${new Date(
            date
          ).toLocaleDateString()}: Sabji: ${mealDetails.sabji}, Roti: ${
            mealDetails.roti
          }, Chawal: ${mealDetails.chawal}, Dal: ${mealDetails.dal}${
            mealDetails.additional
              ? `, Additional: ${mealDetails.additional}`
              : ""
          }`
        );

        // Emit WebSocket event
        global.io?.emit("mealUpdate", {
          ...update,
          tiffinName: tiffin.name,
          userId: enrollment.userId,
        });

        return update;
      })
    );

    return new Response(JSON.stringify(updates), {
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
    console.error("Meal update error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to send meal updates" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
