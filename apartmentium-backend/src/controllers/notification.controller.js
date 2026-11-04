import prisma from "../config/prisma.js";

export async function getNotifications(req, res) {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.count({
        where: { userId: req.user.id, readAt: null },
      }),
    ]);

    return res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load notifications." });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const result = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    if (!result.count) {
      const exists = await prisma.notification.count({
        where: { id: req.params.id, userId: req.user.id },
      });
      if (!exists) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found." });
      }
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update notification." });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return res.json({ success: true });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update notifications." });
  }
}
