const express = require("express");

const {
  checkIn,
  checkOut,
  getAttendanceHistory,
} = require("../controllers/attendanceController");

const router = express.Router();

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/history/:memberId", getAttendanceHistory);

module.exports = router;