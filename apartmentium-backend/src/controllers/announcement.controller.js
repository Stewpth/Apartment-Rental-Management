import prisma from "../config/prisma.js";

function serializeAnnouncement(announcement, read = false) {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    publishedAt: announcement.publishedAt,
    read,
  };
}

export async function getAnnouncements(req, res) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    });
    return res.json({
      success: true,
      data: announcements.map((item) => serializeAnnouncement(item)),
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load announcements." });
  }
}

export async function createAnnouncement(req, res) {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const content =
    typeof req.body.content === "string" ? req.body.content.trim() : "";
  if (!title || title.length > 120 || !content || content.length > 5000) {
    return res.status(400).json({
      success: false,
      message:
        "Enter a title of up to 120 characters and content of up to 5,000 characters.",
    });
  }

  try {
    const announcement = await prisma.announcement.create({
      data: { authorId: req.user.id, title, content },
    });
    return res.status(201).json({
      success: true,
      data: serializeAnnouncement(announcement),
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to publish announcement." });
  }
}

export async function getLatestTenantAnnouncements(req, res) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: 3,
      include: {
        reads: { where: { userId: req.user.id }, select: { id: true } },
      },
    });
    return res.json({
      success: true,
      data: announcements.map((item) =>
        serializeAnnouncement(item, item.reads.length > 0),
      ),
    });
  } catch (error) {
    console.error("Get tenant announcements error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load announcements." });
  }
}

export async function markAnnouncementRead(req, res) {
  try {
    const result = await prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId: req.params.id,
          userId: req.user.id,
        },
      },
      create: { announcementId: req.params.id, userId: req.user.id },
      update: {},
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.code === "P2003") {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found." });
    }
    console.error("Mark announcement read error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update announcement." });
  }
}
