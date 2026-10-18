
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const RESET_EXPIRY_MINUTES = 15;

// Request password reset using registered mobile number
async function requestPasswordReset(req, res) {
  try {
    const { phone } = req.body;

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Registered mobile number is required.",
      });
    }

    const [users] = await pool.query(
      `SELECT id, phone
       FROM users
       WHERE phone = ?
       LIMIT 1`,
      [String(phone).trim()]
    );

    // Same response whether or not the number exists
    const message =
      "If the number is registered, password reset instructions will be sent.";

    if (users.length === 0) {
      return res.status(200).json({ success: true, message });
    }

    const user = users[0];
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Invalidate earlier unused reset links for this user
      await connection.query(
        `UPDATE password_resets
         SET used_at = NOW()
         WHERE user_id = ? AND used_at IS NULL`,
        [user.id]
      );

      await connection.query(
        `INSERT INTO password_resets
          (user_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
        [user.id, tokenHash, RESET_EXPIRY_MINUTES]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // SMS integration will send this link through a configured provider.
    // Do not expose the token in the API response in production.
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink =
      `${frontendUrl}/reset-password?token=${rawToken}`;

    console.log(
      `Password reset requested for user ID ${user.id}. Configure SMS provider to send the reset link.`
    );

    // Temporary development-only response to test the flow locally.
    // Remove resetLink before deploying to production.
    if (process.env.NODE_ENV !== "production") {
      return res.status(200).json({
        success: true,
        message,
        developmentResetLink: resetLink,
      });
    }

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Password reset request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process the password reset request.",
    });
  }
}

// Set a new password using a valid, unused token
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (
      typeof token !== "string" ||
      !token ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid reset token and password of at least 8 characters are required.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT id, user_id
         FROM password_resets
         WHERE token_hash = ?
           AND used_at IS NULL
           AND expires_at > NOW()
         LIMIT 1
         FOR UPDATE`,
        [tokenHash]
      );

      if (rows.length === 0) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Reset link is invalid or expired. Please request a new one.",
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await connection.query(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [passwordHash, rows[0].user_id]
      );

      await connection.query(
        "UPDATE password_resets SET used_at = NOW() WHERE id = ?",
        [rows[0].id]
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Password reset successful. Please log in with your new password.",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Password reset error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password right now.",
    });
  }
}

module.exports = {
  requestPasswordReset,
  resetPassword,
};
