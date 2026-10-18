
const express = require("express");
const { login } = require("../controllers/authController");
const { register } = require("../controllers/registerController");
const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/passwordResetController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;
