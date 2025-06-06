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

    const tiffin = await prisma.tiffin.findFirst();
    return new Response(
      JSON.stringify({ superadminSurplus: tiffin?.superadminSurplus || 100 }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Get settings error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch settings" }), {
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

    const { superadminSurplus } = await req.json();
    if (!superadminSurplus)
      return new Response(
        JSON.stringify({ error: "Missing superadminSurplus" }),
        { status: 400 }
      );

    await prisma.tiffin.updateMany({
      data: {
        superadminSurplus: parseFloat(superadminSurplus),
        totalPrice: {
          set:
            prisma.tiffin.fields.basePrice +
            parseFloat(superadminSurplus) +
            prisma.tiffin.fields.adminCharge,
        },
      },
    });

    return new Response(JSON.stringify({ message: "Settings updated" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update settings" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
