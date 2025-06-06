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

    const tiffins = await prisma.tiffin.findMany({
      include: { admin: { select: { name: true } } },
    });
    return new Response(JSON.stringify(tiffins), { status: 200 });
  } catch (error) {
    console.error("Get tiffins error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch tiffins" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
