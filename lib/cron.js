import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

const getTime = (timeString) => {
  if (!timeString) return { hours: 23, minutes: 59 }; // Default to end of day if not set
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
};

// Auto-accept meals after cancellation deadlines and update tiffinCount
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const meals = await prisma.meal.findMany({
      where: { date: today, status: "pending" },
      include: { tiffin: true, user: true },
    });

    for (const meal of meals) {
      const morningCancel = getTime(meal.tiffin.morningCancelTime || "10:00");
      const eveningCancel = getTime(meal.tiffin.eveningCancelTime || "17:00");
      const morningDeadline = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        morningCancel.hours,
        morningCancel.minutes
      );
      const eveningDeadline = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        eveningCancel.hours,
        eveningCancel.minutes
      );

      if (now > eveningDeadline) {
        // Auto-accept meal
        await prisma.meal.update({
          where: { id: meal.id },
          data: { status: "accepted" },
        });

        // Decrease tiffinCount
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            userId: meal.userId,
            tiffinId: meal.tiffinId,
            status: "active",
          },
        });

        if (enrollment) {
          const decrement = meal.tiffin.mealFrequency === "one-time" ? 1 : 2;
          const newTiffinCount = Math.max(
            0,
            enrollment.tiffinCount - decrement
          );

          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { tiffinCount: newTiffinCount },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId: meal.userId,
              dailyUpdateId: meal.id,
              message: `Meal for ${
                meal.tiffin.name
              } on ${today.toLocaleDateString()} auto-accepted`,
              status: "sent",
            },
          });

          // Deactivate if tiffinCount <= 0
          if (newTiffinCount <= 0) {
            await prisma.enrollment.update({
              where: { id: enrollment.id },
              data: { status: "deactivated", endDate: new Date() },
            });

            await prisma.notification.create({
              data: {
                userId: meal.userId,
                dailyUpdateId: null,
                message: `Your enrollment for ${meal.tiffin.name} has been deactivated due to no remaining meals`,
                status: "sent",
              },
            });
          }
        }
      }
    }
    console.log("Checked meals for auto-acceptance");
  } catch (error) {
    console.error("Cron auto-accept error:", error.message, error.stack);
  } finally {
    await prisma.$disconnect();
  }
});

// Deactivate enrollments based on minSubscriptionDays for one-time
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const enrollments = await prisma.enrollment.findMany({
      where: { status: "active" },
      include: {
        tiffin: {
          select: {
            name: true,
            mealFrequency: true,
            minSubscriptionDays: true,
          },
        },
      },
    });

    for (const enrollment of enrollments) {
      const isOneTime = enrollment.tiffin.mealFrequency === "one-time";
      const minDays = enrollment.tiffin.minSubscriptionDays || 30;
      const startDate = new Date(enrollment.startDate);
      const daysSinceStart = Math.floor(
        (today - startDate) / (24 * 60 * 60 * 1000)
      );

      // Deactivate if one-time and past minSubscriptionDays, or tiffinCount <= 0
      if (
        (isOneTime && daysSinceStart >= minDays) ||
        enrollment.tiffinCount <= 0
      ) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "deactivated", endDate: new Date() },
        });

        await prisma.notification.create({
          data: {
            userId: enrollment.userId,
            dailyUpdateId: null,
            message: `Your enrollment for ${
              enrollment.tiffin.name
            } has been deactivated${
              enrollment.tiffinCount <= 0 ? " due to no remaining meals" : ""
            }`,
            status: "sent",
          },
        });
      }
    }

    console.log("Checked enrollments for deactivation");
  } catch (error) {
    console.error("Cron deactivation error:", error.message, error.stack);
  } finally {
    await prisma.$disconnect();
  }
});
