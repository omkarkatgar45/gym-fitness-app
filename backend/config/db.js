const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const caPath = path.join(__dirname, "ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Aiven MySQL database connected successfully!");
    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  }
}

module.exports = {
  pool,
  testDatabaseConnection,
};