const { pool } = require("../config/db");

/* =====================================================
   CREATE MEMBERSHIP REQUEST
===================================================== */

async function createMembershipRequest(req, res) {
  try {
    const { memberId, planId } = req.body;

    if (!memberId || !planId) {
      return res.status(400).json({
        success: false,
        message: "Member ID and plan ID are required.",
      });
    }

    const [members] = await pool.query(
      `SELECT id FROM members WHERE id = ? LIMIT 1`,
      [memberId]
    );

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const [plans] = await pool.query(
      `SELECT id, plan_name, duration_months, price
       FROM membership_plans
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [planId]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found.",
      });
    }

    const [activeMemberships] = await pool.query(
      `SELECT id
       FROM membership_requests
       WHERE member_id = ?
         AND request_status = 'approved'
         AND end_date >= CURDATE()
       LIMIT 1`,
      [memberId]
    );

    if (activeMemberships.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Member already has an active membership.",
      });
    }

    const [pendingRequests] = await pool.query(
      `SELECT id
       FROM membership_requests
       WHERE member_id = ?
         AND request_status = 'pending'
       LIMIT 1`,
      [memberId]
    );

    if (pendingRequests.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A membership request is already pending for this member.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO membership_requests
       (member_id, plan_id, request_status)
       VALUES (?, ?, 'pending')`,
      [memberId, planId]
    );

    return res.status(201).json({
      success: true,
      message: "Membership request submitted successfully.",
      requestId: result.insertId,
      memberId: Number(memberId),
      plan: {
        id: plans[0].id,
        name: plans[0].plan_name,
        duration_months: plans[0].duration_months,
        price: plans[0].price,
      },
    });
  } catch (error) {
    console.error("Membership request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating membership request.",
    });
  }
}

/* =====================================================
   CREATE PAYMENT + NOTIFICATION
===================================================== */

async function createPayment(req, res) {
  let connection;

  try {
    const {
      membershipRequestId,
      paymentMethod,
      transactionId,
    } = req.body;

    if (
      !membershipRequestId ||
      !paymentMethod ||
      !transactionId ||
      !String(transactionId).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Membership request ID, payment method and transaction ID are required.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [requests] = await connection.query(
      `SELECT
         mr.id AS membership_request_id,
         mr.member_id,
         mr.plan_id,
         mr.request_status,
         m.user_id,
         mp.plan_name,
         mp.price,
         mp.duration_months
       FROM membership_requests mr
       INNER JOIN membership_plans mp ON mp.id = mr.plan_id
       INNER JOIN members m ON m.id = mr.member_id
       WHERE mr.id = ?
       LIMIT 1
       FOR UPDATE`,
      [membershipRequestId]
    );

    if (requests.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    const request = requests[0];

    if (request.request_status === "rejected") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This membership request has been rejected.",
      });
    }

    const [existingPayments] = await connection.query(
      `SELECT id
       FROM payments
       WHERE transaction_id = ?
       LIMIT 1`,
      [String(transactionId).trim()]
    );

    if (existingPayments.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "This transaction ID has already been used.",
      });
    }

    const [requestPayments] = await connection.query(
      `SELECT id, payment_status
       FROM payments
       WHERE membership_request_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [membershipRequestId]
    );

    if (
      requestPayments.length > 0 &&
      requestPayments[0].payment_status === "success"
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment has already been recorded for this membership request.",
      });
    }

    const amount = Number(request.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid membership amount.",
      });
    }

    const [paymentResult] = await connection.query(
      `INSERT INTO payments
       (membership_request_id, amount, payment_method, transaction_id,
        payment_status, paid_at)
       VALUES (?, ?, ?, ?, 'success', NOW())`,
      [
        membershipRequestId,
        amount,
        String(paymentMethod).trim(),
        String(transactionId).trim(),
      ]
    );

    await connection.query(
      `INSERT INTO payment_verifications
       (payment_id, verification_status)
       VALUES (?, 'pending')`,
      [paymentResult.insertId]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES (?, ?, ?)`,
      [
        request.user_id,
        "Payment Submitted",
        `Your payment for ${request.plan_name} has been recorded and is waiting for admin verification.`,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message:
        "Payment recorded successfully. Waiting for admin verification.",
      payment: {
        id: paymentResult.insertId,
        receipt_number: `RCP-${String(paymentResult.insertId).padStart(6, "0")}`,
        membership_request_id: Number(membershipRequestId),
        member_id: request.member_id,
        plan_id: request.plan_id,
        plan_name: request.plan_name,
        duration_months: request.duration_months,
        amount,
        payment_method: String(paymentMethod).trim(),
        transaction_id: String(transactionId).trim(),
        payment_status: "success",
        verification_status: "pending",
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError.message);
      }
    }

    console.error("Create payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while recording payment.",
    });
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   GET MEMBERSHIP REQUEST
===================================================== */

async function getMembershipRequest(req, res) {
  try {
    const requestId = Number(req.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid membership request ID is required.",
      });
    }

    const [rows] = await pool.query(
      `SELECT
         mr.id AS membership_request_id,
         mr.member_id,
         mr.plan_id,
         mr.request_status,
         mr.start_date,
         mr.end_date,
         mr.created_at,
         mp.plan_name,
         mp.duration_months,
         mp.price,
         u.full_name AS member_name
       FROM membership_requests mr
       INNER JOIN membership_plans mp ON mp.id = mr.plan_id
       INNER JOIN members m ON m.id = mr.member_id
       INNER JOIN users u ON u.id = m.user_id
       WHERE mr.id = ?
       LIMIT 1`,
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      request: rows[0],
    });
  } catch (error) {
    console.error("Get membership request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching membership request.",
    });
  }
}

/* =====================================================
   GET MEMBER MEMBERSHIP STATUS
===================================================== */

async function getMemberMembership(req, res) {
  try {
    const memberId = Number(req.params.memberId);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid member ID is required.",
      });
    }

    const [rows] = await pool.query(
      `SELECT
         mr.id AS membership_request_id,
         mr.member_id,
         mr.request_status,
         mr.start_date,
         mr.end_date,
         mp.plan_name,
         mp.duration_months,
         mp.price,
         p.id AS payment_id,
         p.amount,
         p.payment_method,
         p.transaction_id,
         p.payment_status,
         p.paid_at,
         pv.verification_status,
         pv.verified_at
       FROM membership_requests mr
       INNER JOIN membership_plans mp ON mp.id = mr.plan_id
       LEFT JOIN payments p ON p.id = (
         SELECT p2.id
         FROM payments p2
         WHERE p2.membership_request_id = mr.id
         ORDER BY p2.id DESC
         LIMIT 1
       )
       LEFT JOIN payment_verifications pv ON pv.payment_id = p.id
       WHERE mr.member_id = ?
       ORDER BY mr.id DESC
       LIMIT 1`,
      [memberId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        membership: null,
      });
    }

    const membership = rows[0];
    let membershipStatus = "REQUEST_PENDING";

    if (membership.request_status === "rejected") {
      membershipStatus = "REJECTED";
    } else if (membership.verification_status === "pending") {
      membershipStatus = "PAYMENT_PENDING_APPROVAL";
    } else if (
      membership.verification_status === "approved" &&
      membership.request_status === "approved"
    ) {
      membershipStatus =
        membership.end_date &&
        new Date(membership.end_date) < new Date()
          ? "EXPIRED"
          : "ACTIVE";
    }

    return res.status(200).json({
      success: true,
      membership: {
        ...membership,
        membership_status: membershipStatus,
      },
    });
  } catch (error) {
    console.error("Get member membership error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching member membership.",
    });
  }
}

/* =====================================================
   GET PENDING PAYMENTS FOR ADMIN
===================================================== */

async function getPendingPayments(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id AS payment_id,
         mr.id AS membership_request_id,
         mr.member_id,
         mr.request_status,
         u.full_name AS member_name,
         u.email AS member_email,
         u.phone AS member_phone,
         mp.plan_name,
         mp.duration_months,
         mp.price,
         p.amount,
         p.payment_method,
         p.transaction_id,
         p.payment_status,
         p.paid_at,
         pv.verification_status,
         pv.verified_at
       FROM payments p
       INNER JOIN membership_requests mr
         ON mr.id = p.membership_request_id
       INNER JOIN members m ON m.id = mr.member_id
       INNER JOIN users u ON u.id = m.user_id
       INNER JOIN membership_plans mp ON mp.id = mr.plan_id
       INNER JOIN payment_verifications pv ON pv.payment_id = p.id
       WHERE pv.verification_status = 'pending'
       ORDER BY p.id DESC`
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      payments: rows,
    });
  } catch (error) {
    console.error("Get pending payments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending payments.",
    });
  }
}

/* =====================================================
   GET PAYMENT HISTORY FOR ADMIN
===================================================== */

async function getPaymentHistory(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id AS payment_id,
         mr.id AS membership_request_id,
         mr.member_id,
         mr.plan_id,
         mr.request_status,
         mr.start_date,
         mr.end_date,
         u.full_name AS member_name,
         u.email AS member_email,
         u.phone AS member_phone,
         mp.plan_name,
         mp.duration_months,
         mp.price,
         p.amount,
         p.payment_method,
         p.transaction_id,
         p.payment_status,
         p.paid_at,
         p.created_at AS payment_created_at,
         pv.verification_status,
         pv.verified_by,
         pv.verified_at,
         pv.remarks
       FROM payments p
       INNER JOIN membership_requests mr
         ON mr.id = p.membership_request_id
       INNER JOIN members m ON m.id = mr.member_id
       INNER JOIN users u ON u.id = m.user_id
       INNER JOIN membership_plans mp ON mp.id = mr.plan_id
       LEFT JOIN payment_verifications pv ON pv.payment_id = p.id
       ORDER BY p.id DESC`
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      payments: rows,
    });
  } catch (error) {
    console.error("Get payment history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment history.",
    });
  }
}

/* =====================================================
   GET MEMBER PAYMENT HISTORY / RECEIPTS
===================================================== */

async function getMemberPaymentHistory(req, res) {
  try {
    // req.memberId requireMember middleware madhun yeto.
    const memberId = Number(req.memberId);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Authenticated member information is missing.",
      });
    }

    const [rows] = await pool.query(
      `SELECT
         p.id AS payment_id,
         mr.id AS membership_request_id,
         mr.member_id,
         mr.request_status,
         mr.start_date,
         mr.end_date,
         u.full_name AS member_name,
         u.email AS member_email,
         u.phone AS member_phone,
         mp.plan_name,
         mp.duration_months,
         mp.price AS plan_price,
         p.amount,
         p.payment_method,
         p.transaction_id,
         p.payment_status,
         p.paid_at,
         p.created_at AS payment_created_at,
         pv.verification_status,
         pv.verified_at,
         pv.remarks
       FROM payments p
       INNER JOIN membership_requests mr
         ON mr.id = p.membership_request_id
       INNER JOIN members m ON m.id = mr.member_id
       INNER JOIN users u ON u.id = m.user_id
       INNER JOIN membership_plans mp ON mp.id = mr.plan_id
       LEFT JOIN payment_verifications pv ON pv.payment_id = p.id
       WHERE mr.member_id = ?
       ORDER BY p.id DESC`,
      [memberId]
    );

    const payments = rows.map((payment) => ({
      ...payment,
      receipt_number: `RCP-${String(payment.payment_id).padStart(6, "0")}`,
      receipt_status:
        payment.verification_status === "approved"
          ? "Verified"
          : payment.verification_status === "pending"
          ? "Awaiting admin verification"
          : payment.verification_status || "Not verified",
    }));

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Member payment history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load member payment history.",
    });
  }
}

/* =====================================================
   APPROVE PAYMENT + ACTIVATE MEMBERSHIP + NOTIFICATION
===================================================== */

async function approvePayment(req, res) {
  let connection;

  try {
    const { paymentId } = req.body;

    // Admin identity token madhun ghya; body madhlya adminId var trust karu naka.
    const adminId = Number(req.user?.userId);

    if (!Number.isInteger(Number(paymentId)) || Number(paymentId) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payment ID is required.",
      });
    }

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Authenticated admin information is missing.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [admins] = await connection.query(
      `SELECT id
       FROM users
       WHERE id = ?
         AND role_id = 1
         AND status = 'active'
       LIMIT 1`,
      [adminId]
    );

    if (admins.length === 0) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message: "Only an active admin can approve payments.",
      });
    }

    const [payments] = await connection.query(
      `SELECT
         p.id AS payment_id,
         p.payment_status,
         p.membership_request_id,
         mr.member_id,
         mr.plan_id,
         mr.request_status,
         m.user_id,
         mp.plan_name,
         mp.duration_months
       FROM payments p
       INNER JOIN membership_requests mr
         ON mr.id = p.membership_request_id
       INNER JOIN members m ON m.id = mr.member_id
       INNER JOIN membership_plans mp ON mp.id = mr.plan_id
       WHERE p.id = ?
       LIMIT 1
       FOR UPDATE`,
      [paymentId]
    );

    if (payments.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const payment = payments[0];

    if (payment.payment_status !== "success") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Only successful payments can be approved.",
      });
    }

    const [verification] = await connection.query(
      `SELECT id, verification_status
       FROM payment_verifications
       WHERE payment_id = ?
       LIMIT 1
       FOR UPDATE`,
      [paymentId]
    );

    if (verification.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Payment verification record not found.",
      });
    }

    if (verification[0].verification_status === "approved") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This payment has already been approved.",
      });
    }

    if (payment.request_status === "rejected") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Cannot approve a payment for a rejected membership request.",
      });
    }

    const [activeMemberships] = await connection.query(
      `SELECT id
       FROM membership_requests
       WHERE member_id = ?
         AND request_status = 'approved'
         AND end_date >= CURDATE()
         AND id != ?
       LIMIT 1`,
      [payment.member_id, payment.membership_request_id]
    );

    if (activeMemberships.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Member already has an active membership.",
      });
    }

    const durationMonths = Number(payment.duration_months);

    if (!Number.isInteger(durationMonths) || durationMonths <= 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid membership duration.",
      });
    }

    // Parameterize the interval value instead of interpolating SQL.
    await connection.query(
      `UPDATE payment_verifications
       SET verification_status = 'approved',
           verified_by = ?,
           verified_at = NOW()
       WHERE payment_id = ?`,
      [adminId, paymentId]
    );

    await connection.query(
      `UPDATE membership_requests
       SET request_status = 'approved',
           start_date = CURDATE(),
           end_date = DATE_ADD(CURDATE(), INTERVAL ? MONTH)
       WHERE id = ?`,
      [durationMonths, payment.membership_request_id]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES (?, ?, ?)`,
      [
        payment.user_id,
        "Membership Approved",
        `Your ${payment.plan_name} membership has been approved and activated successfully.`,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Payment approved and membership activated successfully.",
      membership: {
        membership_request_id: payment.membership_request_id,
        member_id: payment.member_id,
        plan_id: payment.plan_id,
        plan_name: payment.plan_name,
        duration_months: payment.duration_months,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError.message);
      }
    }

    console.error("Approve payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while approving payment.",
    });
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  createMembershipRequest,
  createPayment,
  getMembershipRequest,
  getMemberMembership,
  getPendingPayments,
  getPaymentHistory,
  getMemberPaymentHistory,
  approvePayment,
};