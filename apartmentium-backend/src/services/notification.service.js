import prisma from "../config/prisma.js";

export async function notifyUser({ userId, type, title, message, link = null }) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  } catch (error) {
    console.error("Create notification error:", error);
  }
}

export async function notifyRoleUsers({
  role,
  type,
  title,
  message,
  link = null,
}) {
  try {
    const users = await prisma.user.findMany({
      where: { role, status: "ACTIVE" },
      select: { id: true },
    });
    if (!users.length) return;

    await prisma.notification.createMany({
      data: users.map(({ id: userId }) => ({
        userId,
        type,
        title,
        message,
        link,
      })),
    });
  } catch (error) {
    console.error("Create role notifications error:", error);
  }
}
