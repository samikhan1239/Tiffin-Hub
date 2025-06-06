import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { uploadImage } from "@/lib/cloudinary";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { id } = params;
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const tiffin = await prisma.tiffin.findUnique({
      where: { id: parseInt(id), adminId: decoded.id },
    });

    if (!tiffin) {
      return new Response(JSON.stringify({ error: "Tiffin not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(tiffin), { status: 200 });
  } catch (error) {
    console.error("Get tiffin error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch tiffin" }), {
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const basePrice = parseFloat(formData.get("basePrice"));
    const superadminSurcharge = parseFloat(formData.get("superadminSurcharge"));
    const totalPrice = parseFloat(formData.get("totalPrice"));
    const mealFrequency = formData.get("mealFrequency");
    const oneTimePrice = formData.get("oneTimePrice")
      ? parseFloat(formData.get("oneTimePrice"))
      : null;
    const twoTimePrice = formData.get("twoTimePrice")
      ? parseFloat(formData.get("twoTimePrice"))
      : null;
    const mealDetails = formData.get("mealDetails");
    const specialDays = JSON.parse(formData.get("specialDays"));
    const specialDaysCount = parseInt(formData.get("specialDaysCount"));
    const trialCost = formData.get("trialCost")
      ? parseFloat(formData.get("trialCost"))
      : null;
    const photo = formData.get("photo");
    const isVegetarian = formData.get("isVegetarian") === "true";
    const deliveryTime = formData.get("deliveryTime");
    const maxCapacity = formData.get("maxCapacity")
      ? parseInt(formData.get("maxCapacity"))
      : null;

    if (
      !name ||
      !description ||
      !basePrice ||
      !superadminSurcharge ||
      !totalPrice ||
      !mealFrequency ||
      !mealDetails ||
      !specialDaysCount
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    let photoUrl = null;
    if (photo) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      photoUrl = await uploadImage(buffer);
    }

    const tiffin = await prisma.tiffin.update({
      where: { id: parseInt(id), adminId: decoded.id },
      data: {
        name,
        description,
        basePrice,
        superadminSurcharge,
        totalPrice,
        mealFrequency,
        oneTimePrice,
        twoTimePrice,
        mealDetails,
        specialDays,
        specialDaysCount,
        trialCost,
        photo: photoUrl || undefined,
        isVegetarian,
        deliveryTime,
        maxCapacity,
      },
    });

    return new Response(JSON.stringify(tiffin), { status: 200 });
  } catch (error) {
    console.error("Update tiffin error:", error);
    return new Response(JSON.stringify({ error: "Failed to update tiffin" }), {
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    await prisma.tiffin.delete({
      where: { id: parseInt(id), adminId: decoded.id },
    });

    return new Response(JSON.stringify({ message: "Tiffin deleted" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Delete tiffin error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete tiffin" }), {
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
}
