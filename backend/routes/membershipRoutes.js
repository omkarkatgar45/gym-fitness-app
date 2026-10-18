const express = require("express");

const {
  createMembershipRequest,
  createPayment,
  getMembershipRequest,
  getMemberMembership,
  getPendingPayments,
  getPaymentHistory,
  getMemberPaymentHistory,
  approvePayment,
} = require("../controllers/membershipController");

const authMiddleware = require("../middleware/authMiddleware");
const requireMember = require("../middleware/requireMember");

const router = express.Router();

/* =====================================================
   MEMBERSHIP REQUEST
===================================================== */

router.post("/request", createMembershipRequest);

/* =====================================================
   PAYMENT
===================================================== */

router.post("/payment", createPayment);

/* =====================================================
   GET MEMBERSHIP REQUEST
===================================================== */

router.get("/request/:requestId", getMembershipRequest);

/* =====================================================
   MEMBER - PAYMENT HISTORY / RECEIPTS
   Login required + own member account only
===================================================== */

router.get(
  "/member/:memberId/payments",
  authMiddleware,
  requireMember,
  (req, res, next) => {
    if (Number(req.params.memberId) !== req.memberId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own payment history.",
      });
    }

    next();
  },
  getMemberPaymentHistory
);

/* =====================================================
   GET MEMBER MEMBERSHIP
===================================================== */

router.get(
  "/member/:memberId",
  authMiddleware,
  (req, res, next) => {
    const roleId = Number(req.user?.roleId);
    const requestedMemberId = Number(req.params.memberId);
    const loggedInMemberId = Number(req.user?.memberId);

    // Members can access only their own membership.
    if (roleId === 4 && requestedMemberId !== loggedInMemberId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own membership.",
      });
    }

    // Only members and authorized staff roles should continue.
    if (![1, 2, 3, 4].includes(roleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  },
  getMemberMembership
);

/* =====================================================
   ADMIN - PENDING PAYMENTS
===================================================== */

router.get(
  "/admin/pending-payments",
  authMiddleware,
  (req, res, next) => {
    if (![1, 2].includes(Number(req.user?.roleId))) {
      return res.status(403).json({
        success: false,
        message: "Admin or receptionist access required.",
      });
    }

    next();
  },
  getPendingPayments
);

/* =====================================================
   ADMIN - PAYMENT HISTORY
===================================================== */

router.get(
  "/admin/payment-history",
  authMiddleware,
  (req, res, next) => {
    if (![1, 2].includes(Number(req.user?.roleId))) {
      return res.status(403).json({
        success: false,
        message: "Admin or receptionist access required.",
      });
    }

    next();
  },
  getPaymentHistory
);

/* =====================================================
   ADMIN - APPROVE PAYMENT
===================================================== */

router.put(
  "/admin/approve-payment",
  authMiddleware,
  (req, res, next) => {
    if (Number(req.user?.roleId) !== 1) {
      return res.status(403).json({
        success: false,
        message: "Admin access required to approve payments.",
      });
    }

    next();
  },
  approvePayment
);

module.exports = router;