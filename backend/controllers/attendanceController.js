
const { pool } = require("../config/db");

const getMemberInfo = async (memberId) => {
  const [rows] = await pool.query(
    `
    SELECT
      m.id AS member_id,
      u.full_name AS member_name
    FROM members m
    INNER JOIN users u ON u.id = m.user_id
    WHERE m.id = ?
    LIMIT 1
    `,
    [memberId]
  );

  return rows[0] || null;
};

const checkIn = async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        message: "Member ID is required.",
      });
    }

    const member = await getMemberInfo(memberId);

    if (!member) {
      return res.status(404).json({
        message: "Member not found.",
      });
    }

    // Check whether attendance already exists today
    const [todayAttendance] = await pool.query(
      `
      SELECT id, check_in, check_out
      FROM attendance
      WHERE member_id = ?
        AND attendance_date = CURDATE()
      ORDER BY id DESC
      LIMIT 1
      `,
      [memberId]
    );

    if (todayAttendance.length > 0) {
      const record = todayAttendance[0];

      return res.status(400).json({
        message: record.check_out
          ? "Today's attendance is already completed. You can check in tomorrow."
          : "You are already checked in today.",
      });
    }

    // Prevent an old unfinished check-in from being abandoned
    const [openAttendance] = await pool.query(
      `
      SELECT id
      FROM attendance
      WHERE member_id = ?
        AND check_out IS NULL
      LIMIT 1
      `,
      [memberId]
    );

    if (openAttendance.length > 0) {
      return res.status(400).json({
        message:
          "You have an unfinished check-in from a previous day. Please contact the gym receptionist.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO attendance
        (member_id, check_in, attendance_date)
      VALUES (?, NOW(), CURDATE())
      `,
      [memberId]
    );

    const [attendanceRows] = await pool.query(
      `
      SELECT id, member_id, check_in, check_out, attendance_date
      FROM attendance
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      message: "Member checked in successfully.",
      attendance: {
        ...attendanceRows[0],
        member_name: member.member_name,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);

    return res.status(500).json({
      message: "Server error during check-in.",
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        message: "Member ID is required.",
      });
    }

    const member = await getMemberInfo(memberId);

    if (!member) {
      return res.status(404).json({
        message: "Member not found.",
      });
    }

    // Only today's unfinished check-in can be checked out
    const [openAttendance] = await pool.query(
      `
      SELECT id
      FROM attendance
      WHERE member_id = ?
        AND attendance_date = CURDATE()
        AND check_out IS NULL
      ORDER BY id DESC
      LIMIT 1
      `,
      [memberId]
    );

    if (openAttendance.length === 0) {
      const [todayAttendance] = await pool.query(
        `
        SELECT id, check_out
        FROM attendance
        WHERE member_id = ?
          AND attendance_date = CURDATE()
        ORDER BY id DESC
        LIMIT 1
        `,
        [memberId]
      );

      return res.status(400).json({
        message:
          todayAttendance.length > 0 && todayAttendance[0].check_out
            ? "You have already checked out today."
            : "No active check-in found for today.",
      });
    }

    const attendanceId = openAttendance[0].id;

    const [updateResult] = await pool.query(
      `
      UPDATE attendance
      SET check_out = NOW()
      WHERE id = ?
        AND check_out IS NULL
      `,
      [attendanceId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({
        message: "Attendance has already been checked out.",
      });
    }

    const [attendanceRows] = await pool.query(
      `
      SELECT id, member_id, check_in, check_out, attendance_date
      FROM attendance
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    return res.status(200).json({
      message: "Member checked out successfully.",
      attendance: {
        ...attendanceRows[0],
        member_name: member.member_name,
      },
    });
  } catch (error) {
    console.error("Check-out error:", error);

    return res.status(500).json({
      message: "Server error during check-out.",
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({
        message: "Member ID is required.",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        a.id,
        a.member_id,
        a.check_in,
        a.check_out,
        a.attendance_date,
        u.full_name AS member_name
      FROM attendance a
      INNER JOIN members m ON m.id = a.member_id
      INNER JOIN users u ON u.id = m.user_id
      WHERE a.member_id = ?
      ORDER BY a.attendance_date DESC, a.id DESC
      `,
      [memberId]
    );

    return res.status(200).json({
      attendance: rows,
    });
  } catch (error) {
    console.error("Attendance history error:", error);

    return res.status(500).json({
      message: "Server error while loading attendance history.",
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceHistory,
};