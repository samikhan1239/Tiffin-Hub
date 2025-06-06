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

    const users = await prisma.user.findMany({ where: { role: "user" } });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Get users error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
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

    const { userId, isActive } = await req.json();
    if (!userId)
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });

    const user = await prisma.user.update({
      where: { id: parseInt(userId), role: "user" },
      data: { isActive },
    });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    return new Response(JSON.stringify({ error: "Failed to update user" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
