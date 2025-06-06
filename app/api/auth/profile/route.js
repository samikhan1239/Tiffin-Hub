import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { uploadImage } from "@/lib/cloudinary";

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
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        deliveryPlace: true,
        photo: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const deliveryPlace = formData.get("deliveryPlace");
    const photo = formData.get("photo");

    let photoUrl = null;
    if (photo) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      photoUrl = await uploadImage(buffer);
    }

    const updateData = {
      name,
      email,
      phone,
      ...(decoded.role === "user" && deliveryPlace ? { deliveryPlace } : {}),
      ...(photoUrl ? { photo: photoUrl } : {}),
    };

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        deliveryPlace: true,
        photo: true,
      },
    });

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.name === "JsonWebTokenError") {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
