import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });

    const { id } = params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tiffin = await prisma.tiffin.findUnique({
      where: { id: parseInt(id), adminId: decoded.id },
    });
    if (!tiffin)
      return new Response(
        JSON.stringify({ error: "Tiffin not found or unauthorized" }),
        { status: 404 }
      );

    const dailyUpdate = await prisma.dailyUpdate.upsert({
      where: { tiffinId_date: { tiffinId: parseInt(id), date: today } },
      update: { status: "cancelled" },
      create: {
        tiffinId: parseInt(id),
        date: today,
        mealDetails: tiffin.mealDetails,
        status: "cancelled",
      },
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { tiffinId: parseInt(id), status: "active" },
    });
    for (const enrollment of enrollments) {
      await prisma.notification.create({
        data: {
          userId: enrollment.userId,
          dailyUpdateId: dailyUpdate.id,
          message: `Meals for ${
            tiffin.name
          } cancelled for ${today.toLocaleDateString()}`,
          status: "sent",
        },
      });
    }

    return new Response(JSON.stringify(dailyUpdate), { status: 200 });
  } catch (error) {
    console.error("Cancel today error:", error);
    return new Response(JSON.stringify({ error: "Failed to cancel meals" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
