const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [users] = await pool.query(
      `
      SELECT
        u.id,
        u.role_id,
        u.full_name,
        u.email,
        u.phone,
        u.password_hash,
        u.status,
        r.role_name,
        m.id AS member_id
      FROM users u
      INNER JOIN roles r
        ON u.role_id = r.id
      LEFT JOIN members m
        ON m.user_id = u.id
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        memberId: user.member_id,
        roleId: user.role_id,
        role: user.role_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        member_id: user.member_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role: user.role_name,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
}

module.exports = {
  login,
};