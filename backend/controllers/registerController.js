const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

async function register(req, res) {
  let connection;

  try {
    const {
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Role 4 = Member
    const [userResult] = await connection.query(
      `
      INSERT INTO users
      (role_id, full_name, email, phone, password_hash, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [4, fullName, email, phone || null, passwordHash, "pending"]
    );

    await connection.query(
      `
      INSERT INTO members
      (user_id, date_of_birth, gender, address, member_status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        userResult.insertId,
        dateOfBirth || null,
        gender || null,
        address || null,
        "pending",
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Registration successful. Waiting for admin approval.",
      userId: userResult.insertId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  register,
};