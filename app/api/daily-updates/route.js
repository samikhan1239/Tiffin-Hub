import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req) {
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

    const { tiffinId, date, mealDetails } = await req.json();
    if (!tiffinId || !date || !mealDetails?.lunch) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const tiffin = await prisma.tiffin.findUnique({
      where: { id: parseInt(tiffinId), adminId: decoded.id },
    });
    if (!tiffin)
      return new Response(
        JSON.stringify({ error: "Tiffin not found or unauthorized" }),
        { status: 404 }
      );

    const dailyUpdate = await prisma.dailyUpdate.create({
      data: {
        tiffinId: parseInt(tiffinId),
        date: new Date(date),
        mealDetails,
        status: "pending",
      },
    });

    // Create notifications for enrolled users
    const enrollments = await prisma.enrollment.findMany({
      where: { tiffinId: parseInt(tiffinId), status: "active" },
    });
    for (const enrollment of enrollments) {
      await prisma.notification.create({
        data: {
          userId: enrollment.userId,
          dailyUpdateId: dailyUpdate.id,
          message: `New update for ${tiffin.name} on ${new Date(
            date
          ).toLocaleDateString()}`,
          status: "sent",
        },
      });
    }

    return new Response(JSON.stringify(dailyUpdate), { status: 201 });
  } catch (error) {
    console.error("Daily update error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create daily update" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: decoded.id, status: "active" },
    });
    const tiffinIds = enrollments.map((e) => e.tiffinId);

    const dailyUpdates = await prisma.dailyUpdate.findMany({
      where: { tiffinId: { in: tiffinIds } },
      include: { tiffin: { select: { name: true } } },
      orderBy: { date: "desc" },
    });

    return new Response(JSON.stringify(dailyUpdates), { status: 200 });
  } catch (error) {
    console.error("Get daily updates error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch daily updates" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
