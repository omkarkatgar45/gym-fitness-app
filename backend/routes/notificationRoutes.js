
const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

// Get notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const [notifications] = await pool.query(
      `SELECT id, user_id, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const unreadCount = notifications.filter(
      (notification) => Number(notification.is_read) === 0
    ).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch notifications.",
    });
  }
});

// Mark one notification as read
router.patch("/:userId/:notificationId/read", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const notificationId = Number(req.params.notificationId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isInteger(notificationId) ||
      notificationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or notification ID.",
      });
    }

    const [result] = await pool.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
});

module.exports = router;
