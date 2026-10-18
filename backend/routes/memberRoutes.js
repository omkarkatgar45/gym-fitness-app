const express = require("express");

const {
  getPendingMembers,
  approveMember,
  getMemberHistory,
  getActiveMembers,
  deactivateMember,
  getMemberById,
} = require("../controllers/memberController");

const router = express.Router();

/* =====================================================
   PENDING MEMBERS
===================================================== */

router.get("/pending", getPendingMembers);

/* =====================================================
   APPROVE MEMBER
===================================================== */

router.put("/approve/:memberId", approveMember);

/* =====================================================
   MEMBER HISTORY
===================================================== */

router.get("/history", getMemberHistory);

/* =====================================================
   ACTIVE MEMBERS
===================================================== */

router.get("/active", getActiveMembers);

/* =====================================================
   REMOVE / DEACTIVATE MEMBER
===================================================== */

router.put("/deactivate/:memberId", deactivateMember);

/* =====================================================
   GET MEMBER BY ID
===================================================== */

router.get("/:memberId", getMemberById);

module.exports = router;