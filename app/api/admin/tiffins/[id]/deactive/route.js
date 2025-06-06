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

    const tiffin = await prisma.tiffin.findUnique({
      where: { id: parseInt(id), adminId: decoded.id },
    });
    if (!tiffin)
      return new Response(
        JSON.stringify({ error: "Tiffin not found or unauthorized" }),
        { status: 404 }
      );

    await prisma.enrollment.updateMany({
      where: { tiffinId: parseInt(id), status: "active" },
      data: { status: "deactivated", endDate: new Date() },
    });

    await prisma.tiffin.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { tiffinId: parseInt(id) },
    });
    for (const enrollment of enrollments) {
      await prisma.notification.create({
        data: {
          userId: enrollment.userId,
          dailyUpdateId: null,
          message: `${tiffin.name} has been deactivated`,
          status: "sent",
        },
      });
    }

    return new Response(
      JSON.stringify({ message: "Tiffin and enrollments deactivated" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Deactivate tiffin error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to deactivate tiffin" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
