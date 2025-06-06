import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: No token provided" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin role required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const enrollmentId = parseInt(params.id);
    if (isNaN(enrollmentId)) {
      return new Response(JSON.stringify({ error: "Invalid enrollment ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        tiffin: {
          select: {
            id: true,
            name: true,
            totalPrice: true,
            mealDetails: true,
            photo: true,
            adminId: true,
          },
        },
      },
    });

    if (!enrollment) {
      return new Response(JSON.stringify({ error: "Enrollment not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ensure the admin owns the tiffin
    if (enrollment.tiffin.adminId !== decoded.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Not your tiffin" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(enrollment), {
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
    } else if (error instanceof jwt.JsonWebTokenError) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Fetch enrollment error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to fetch enrollment" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req, { params }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: No token provided" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin role required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const enrollmentId = parseInt(params.id);
    const { status } = await req.json();

    if (!["active", "cancelled"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status value" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { tiffin: { select: { adminId: true } } },
    });

    if (!enrollment) {
      return new Response(JSON.stringify({ error: "Enrollment not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ensure the admin owns the tiffin
    if (enrollment.tiffin.adminId !== decoded.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Not your tiffin" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (enrollment.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Enrollment is not pending" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status },
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: updatedEnrollment.userId,
        mealId: null, // No specific daily update
        message: `Your enrollment for ${enrollment.tiffin.name} has been ${status}.`,
        status: "sent",
      },
    });

    return new Response(JSON.stringify(updatedEnrollment), {
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
    } else if (error instanceof jwt.JsonWebTokenError) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Update enrollment error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to update enrollment" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
