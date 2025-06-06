import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req) {
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

    const tiffins = await prisma.tiffin.findMany({
      where: { adminId: decoded.id },
    });
    const tiffinIds = tiffins.map((t) => t.id);

    const enrollments = await prisma.enrollment.findMany({
      where: { tiffinId: { in: tiffinIds }, status: "active" },
    });

    const payment = await prisma.payment.findFirst({
      where: {
        adminId: decoded.id,
        month: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const enrolledCount = enrollments.length;
    const superadminSurplus = tiffins.reduce(
      (sum, t) => sum + t.superadminSurplus,
      0
    );
    const adminCharge = payment?.adminCharge || 500;
    const totalAmount = enrolledCount * superadminSurplus + adminCharge;

    return new Response(
      JSON.stringify({
        enrolledCount,
        superadminSurplus,
        adminCharge,
        totalAmount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Enrollment stats error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
