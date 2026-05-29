const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
router.get("/doctor-stats", authenticate, async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        appointments: true, // Pull appointments in one go to aggregate via JS safely
        _count: {
          select: { queueTokens: true }, // Handles queue sizing count directly
        },
      },
    });

    const reportData = doctors.map((doc) => {
      const totalAppointments = doc.appointments.length;
      const completedAppointments = doc.appointments.filter(
        (a) => a.status === "COMPLETED",
      ).length;
      const cancelledAppointments = doc.appointments.filter(
        (a) => a.status === "CANCELLED",
      ).length;
      const revenue = completedAppointments * doc.consultationFee;

      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        todayQueueSize: doc._count.queueTokens,
        revenue,
      };
    });

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate report" });
  }
});

module.exports = router;