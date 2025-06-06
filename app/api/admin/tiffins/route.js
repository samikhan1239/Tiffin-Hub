import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { uploadImage } from "@/lib/cloudinary";

const prisma = new PrismaClient();

export async function GET(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tiffins = await prisma.tiffin.findMany({
      where: { adminId: decoded.id },
    });

    return new Response(JSON.stringify(tiffins), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return new Response(
        JSON.stringify({ error: "Session expired, please log in again" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.error("Get tiffins error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: "Failed to fetch tiffins" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await req.formData();
    const name = data.get("name");
    const description = data.get("description");
    const basePrice = parseFloat(data.get("basePrice"));
    const superadminSurplus = parseFloat(
      data.get("superadminSurplus") || "100"
    );
    const totalPrice = parseFloat(data.get("totalPrice"));
    const mealFrequency = data.get("mealFrequency");
    const oneTimePrice = data.get("oneTimePrice")
      ? parseFloat(data.get("oneTimePrice"))
      : null;
    const twoTimePrice = data.get("twoTimePrice")
      ? parseFloat(data.get("twoTimePrice"))
      : null;
    const mealDetails = JSON.parse(data.get("mealDetails"));
    const specialDays = JSON.parse(data.get("specialDays"));
    const specialDaysCount = parseInt(data.get("specialDaysCount"));
    const trialCost = data.get("trialCost")
      ? parseFloat(data.get("trialCost"))
      : null;
    const photo = data.get("photo");
    const isVegetarian = data.get("isVegetarian") === "true";
    const dietaryPrefs = JSON.parse(data.get("dietaryPrefs"));
    const deliveryTime = data.get("deliveryTime") || null;
    const morningCancelTime = data.get("morningCancelTime");
    const eveningCancelTime = data.get("eveningCancelTime");
    const minSubscriptionDays = data.get("minSubscriptionDays")
      ? parseInt(data.get("minSubscriptionDays"))
      : null;
    const cancelNoticePeriod = data.get("cancelNoticePeriod")
      ? parseInt(data.get("cancelNoticePeriod"))
      : null;
    const maxCapacity = data.get("maxCapacity")
      ? parseInt(data.get("maxCapacity"))
      : null;

    // Validate required fields
    if (
      !name ||
      !description ||
      !basePrice ||
      !totalPrice ||
      !mealFrequency ||
      !mealDetails ||
      !specialDaysCount ||
      !morningCancelTime ||
      !eveningCancelTime ||
      !minSubscriptionDays ||
      !cancelNoticePeriod
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate mealDetails structure
    if (!mealDetails.sabjis || !mealDetails.roti || !mealDetails.chawal) {
      return new Response(
        JSON.stringify({ error: "Invalid meal details structure" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate totalPrice (basePrice + superadminSurplus)
    if (totalPrice !== basePrice + superadminSurplus) {
      return new Response(JSON.stringify({ error: "Total price mismatch" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let photoUrl = null;
    if (photo && typeof photo === "object") {
      const buffer = Buffer.from(await photo.arrayBuffer());
      photoUrl = await uploadImage(buffer);
    }

    const newTiffin = await prisma.tiffin.create({
      data: {
        name,
        description,
        basePrice,
        superadminSurplus,
        totalPrice,
        mealFrequency,
        oneTimePrice,
        twoTimePrice,
        mealDetails,
        specialDays,
        specialDaysCount,
        trialCost,
        photo: photoUrl,
        isVegetarian,
        dietaryPrefs: dietaryPrefs.join(","), // Convert array to comma-separated string
        deliveryTime,
        morningCancelTime,
        eveningCancelTime,
        minSubscriptionDays,
        cancelNoticePeriod,
        maxCapacity,
        adminId: decoded.id,
      },
    });

    return new Response(JSON.stringify(newTiffin), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return new Response(
        JSON.stringify({ error: "Session expired, please log in again" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.error("Add tiffin error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: "Failed to add tiffin" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
