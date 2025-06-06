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
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { month: "desc" },
    });

    return new Response(JSON.stringify(payments), { status: 200 });
  } catch (error) {
    console.error("Get payments error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch payments" }), {
      status: 500,
    });
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

    const { paymentId, status, adminCharge } = await req.json();
    if (!paymentId || !status)
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );

    const payment = await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        status,
        adminCharge: adminCharge ? parseFloat(adminCharge) : undefined,
      },
    });

    if (status === "rejected") {
      await prisma.user.update({
        where: { id: payment.adminId },
        data: { isActive: false },
      });
    }

    return new Response(JSON.stringify(payment), { status: 200 });
  } catch (error) {
    console.error("Update payment error:", error);
    return new Response(JSON.stringify({ error: "Failed to update payment" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
