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
    if (decoded.role !== "superadmin")
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });

    const payments = await prisma.payment.findMany({
      where: { status: "pending" },
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { month: "desc" },
    });

    // Aggregate stats by admin
    const statsObj = payments.reduce((acc, payment) => {
      const adminId = payment.adminId;
      if (!acc[adminId]) {
        acc[adminId] = {
          adminId,
          adminName: payment.admin.name,
          adminEmail: payment.admin.email,
          enrolledCount: 0,
          adminCharge: payment.adminCharge,
          superadminSurplus: payment.superadminSurplus,
          totalAmount: 0,
        };
      }
      acc[adminId].enrolledCount += 1; // Assuming each payment represents one "enrolled tiffin"
      acc[adminId].totalAmount =
        acc[adminId].enrolledCount * payment.superadminSurplus +
        payment.adminCharge;
      return acc;
    }, {});

    const stats = Object.values(statsObj);

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (error) {
    console.error("Get payment stats error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch payment stats" }),
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin")
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });

    const { adminCharge, superadminSurplus } = await req.json();
    if (
      (adminCharge !== undefined && (isNaN(adminCharge) || adminCharge < 0)) ||
      (superadminSurplus !== undefined &&
        (isNaN(superadminSurplus) || superadminSurplus < 0))
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid adminCharge or superadminSurplus" }),
        { status: 400 }
      );
    }

    const updateData = {};
    if (adminCharge !== undefined)
      updateData.adminCharge = parseFloat(adminCharge);
    if (superadminSurplus !== undefined)
      updateData.superadminSurplus = parseFloat(superadminSurplus);

    // Update all pending payments
    await prisma.payment.updateMany({
      where: { status: "pending" },
      data: updateData,
    });

    // Update superadminSurplus in related Tiffins if provided
    if (superadminSurplus !== undefined) {
      await prisma.tiffin.updateMany({
        data: { superadminSurplus: parseFloat(superadminSurplus) },
      });
    }

    return new Response(
      JSON.stringify({ message: "Settings updated successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Update payment settings error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update settings" }),
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
