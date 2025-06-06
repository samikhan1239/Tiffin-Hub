import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
    });

    return new Response(JSON.stringify(admins), { status: 200 });
  } catch (error) {
    console.error("GET /api/admins error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch admins" }), {
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

    const { adminId, isApproved } = await req.json();
    if (!adminId)
      return new Response(JSON.stringify({ error: "Missing adminId" }), {
        status: 400,
      });

    const updated = await prisma.user.update({
      where: { id: parseInt(adminId), role: "admin" },
      data: { isApproved },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error("Update admin error:", err);
    return new Response(JSON.stringify({ error: "Failed to update admin" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
