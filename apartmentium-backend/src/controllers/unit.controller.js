import prisma from "../config/prisma.js";

export async function createUnit(req, res) {
  try {
    const { unitNumber, description, unitPrice } = req.body;

    // Validate required fields
    if (
      typeof unitNumber !== "string" ||
      !unitNumber.trim() ||
      unitPrice === undefined ||
      unitPrice === null ||
      unitPrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Unit number and unit price are required.",
      });
    }

    // Validate unit price
    const parsedUnitPrice = Number(unitPrice);

    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit price must be a valid amount greater than zero.",
      });
    }

    // Validate optional description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string.",
      });
    }

    const unit = await prisma.unit.create({
      data: {
        unitNumber: unitNumber.trim(),
        description: description?.trim() || null,
        unitPrice: parsedUnitPrice,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Unit created successfully.",
      unit,
    });
  } catch (error) {
    // Prisma unique constraint error
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A unit with this unit number already exists.",
      });
    }

    console.error("Create unit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create unit.",
    });
  }
}

export async function getAvailableUnits(req, res) {
  try {
    const units = await prisma.unit.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        unitNumber: "asc",
      },
      select: {
        id: true,
        unitNumber: true,
        description: true,
        unitPrice: true,
        status: true,
      },
    });

    return res.status(200).json({
      success: true,
      units,
    });
  } catch (error) {
    console.error("Get available units error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available units.",
    });
  }
}
