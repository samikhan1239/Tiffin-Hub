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
    if (decoded.role !== "user")
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });

    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.id },
      include: {
        dailyUpdate: { include: { tiffin: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    console.error("Get notifications error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch notifications" }),
      { status: 500 }
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
    if (decoded.role !== "user")
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });

    const { notificationId } = await req.json();
    if (!notificationId)
      return new Response(JSON.stringify({ error: "Missing notificationId" }), {
        status: 400,
      });

    const notification = await prisma.notification.update({
      where: { id: parseInt(notificationId), userId: decoded.id },
      data: { status: "read" },
    });

    return new Response(JSON.stringify(notification), { status: 200 });
  } catch (error) {
    console.error("Update notification error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update notification" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
