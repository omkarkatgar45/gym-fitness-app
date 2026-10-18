
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const {
  pool,
  testDatabaseConnection,
} = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const workoutPlanRoutes = require("./routes/workoutPlanRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/notifications", notificationRoutes);

// Public Home Page Statistics
app.get("/api/public/stats", async (req, res) => {
  try {
    const [memberRows] = await pool.query(`
      SELECT COUNT(*) AS totalMembers
      FROM members
    `);

    const [attendanceRows] = await pool.query(`
      SELECT COUNT(DISTINCT member_id) AS todaysAttendance
      FROM attendance
      WHERE attendance_date = CURDATE()
    `);

    const [membershipRows] = await pool.query(`
      SELECT COUNT(DISTINCT mr.id) AS activeMemberships
      FROM membership_requests mr
      INNER JOIN members m
        ON m.id = mr.member_id
      INNER JOIN users u
        ON u.id = m.user_id
      WHERE mr.request_status = 'approved'
        AND mr.start_date <= CURDATE()
        AND mr.end_date >= CURDATE()
        AND m.member_status = 'approved'
        AND u.status = 'active'
    `);

    res.status(200).json({
      success: true,
      stats: {
        totalMembers: Number(memberRows[0].totalMembers),
        todaysAttendance: Number(
          attendanceRows[0].todaysAttendance
        ),
        activeMemberships: Number(
          membershipRows[0].activeMemberships
        ),
      },
    });
  } catch (error) {
    console.error("Public statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load gym statistics.",
    });
  }
});

// Backend health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Gym Fitness App Backend is running!",
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});