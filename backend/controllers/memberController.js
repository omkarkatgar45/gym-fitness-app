const { pool } = require("../config/db");

/* =====================================================
   GET PENDING MEMBERS
===================================================== */

async function getPendingMembers(req, res) {
  try {
    const [members] = await pool.query(`
      SELECT
        m.id AS member_id,
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        m.date_of_birth,
        m.gender,
        m.address,
        m.member_status,
        u.status AS user_status,
        m.created_at AS registration_date
      FROM members m
      INNER JOIN users u
        ON m.user_id = u.id
      WHERE m.member_status = 'pending'
      ORDER BY m.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get pending members error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending members.",
      error: error.message,
    });
  }
}


/* =====================================================
   APPROVE MEMBER
===================================================== */

async function approveMember(req, res) {
  let connection = null;

  try {
    const { memberId } = req.params;

    console.log("=================================");
    console.log("APPROVE MEMBER REQUEST");
    console.log("Received memberId:", memberId);

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required.",
      });
    }

    const numericMemberId = Number(memberId);

    if (
      !Number.isInteger(numericMemberId) ||
      numericMemberId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Member ID.",
      });
    }

    connection = await pool.getConnection();

    console.log("Database connection acquired.");

    await connection.beginTransaction();

    console.log("Transaction started.");

    const [members] = await connection.query(
      `
      SELECT
        id,
        user_id,
        member_status
      FROM members
      WHERE id = ?
      LIMIT 1
      `,
      [numericMemberId]
    );

    console.log("Member lookup result:", members);

    if (members.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const member = members[0];
    const userId = member.user_id;

    console.log("Found member:");
    console.log("Member ID:", member.id);
    console.log("User ID:", userId);
    console.log("Current member status:", member.member_status);

    if (member.member_status === "approved") {
      await connection.rollback();

      return res.status(200).json({
        success: true,
        message: "Member is already approved.",
        memberId: numericMemberId,
      });
    }

    await connection.query(
      `
      UPDATE users
      SET status = 'active'
      WHERE id = ?
      `,
      [userId]
    );

    console.log("Users update completed.");

    const [memberUpdate] = await connection.query(
      `
      UPDATE members
      SET member_status = 'approved'
      WHERE id = ?
      `,
      [numericMemberId]
    );

    console.log(
      "Members affected rows:",
      memberUpdate.affectedRows
    );

    if (memberUpdate.affectedRows === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Member status could not be updated.",
      });
    }

    await connection.commit();

    console.log("Transaction committed successfully.");
    console.log("Member approved successfully:", numericMemberId);
    console.log("=================================");

    return res.status(200).json({
      success: true,
      message: "Member approved successfully.",
      memberId: numericMemberId,
    });
  } catch (error) {
    console.error("=================================");
    console.error("APPROVE MEMBER ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL State:", error.sqlState);
    console.error("=================================");

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error while approving member.",
      error: error.message,
      code: error.code || null,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}


/* =====================================================
   GET ALL REGISTERED MEMBERS
===================================================== */

async function getMemberHistory(req, res) {
  try {
    const [members] = await pool.query(`
      SELECT
        m.id AS member_id,
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,

        m.date_of_birth,
        m.gender,
        m.address,

        m.member_status,
        u.status AS user_status,

        m.created_at AS registration_date

      FROM members m

      INNER JOIN users u
        ON u.id = m.user_id

      ORDER BY m.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error(
      "Get member history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching member history.",
      error: error.message,
    });
  }
}


/* =====================================================
   GET ACTIVE MEMBERS
===================================================== */

async function getActiveMembers(req, res) {
  try {
    const [members] = await pool.query(`
      SELECT
        m.id AS member_id,
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,

        m.date_of_birth,
        m.gender,
        m.address,

        m.member_status,
        u.status AS user_status,

        m.created_at AS registration_date

      FROM members m

      INNER JOIN users u
        ON u.id = m.user_id

      WHERE
        m.member_status = 'approved'
        AND u.status = 'active'

      ORDER BY m.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error(
      "Get active members error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching active members.",
      error: error.message,
    });
  }
}


/* =====================================================
   DEACTIVATE / REMOVE MEMBER
===================================================== */

async function deactivateMember(req, res) {
  let connection = null;

  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required.",
      });
    }

    const numericMemberId = Number(memberId);

    if (
      !Number.isInteger(numericMemberId) ||
      numericMemberId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Member ID.",
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [members] = await connection.query(
      `
      SELECT
        id,
        user_id
      FROM members
      WHERE id = ?
      LIMIT 1
      `,
      [numericMemberId]
    );

    if (members.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const userId = members[0].user_id;

    /*
      We deactivate the user instead of deleting
      the database record.

      This keeps:
      - registration history
      - payment history
      - membership history
      - attendance history
      intact.
    */

    const [userUpdate] = await connection.query(
      `
      UPDATE users
      SET status = 'inactive'
      WHERE id = ?
      `,
      [userId]
    );

    if (userUpdate.affectedRows === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Member could not be deactivated.",
      });
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Member removed successfully.",
      memberId: numericMemberId,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError.message
        );
      }
    }

    console.error(
      "Deactivate member error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while removing member.",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}


/* =====================================================
   GET MEMBER BY ID
===================================================== */

async function getMemberById(req, res) {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required.",
      });
    }

    const [members] = await pool.query(
      `
      SELECT
        m.id AS member_id,
        u.full_name AS member_name
      FROM members m
      INNER JOIN users u
        ON m.user_id = u.id
      WHERE m.id = ?
      LIMIT 1
      `,
      [memberId]
    );

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      member: members[0],
    });
  } catch (error) {
    console.error(
      "Get member by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching member.",
      error: error.message,
    });
  }
}


/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  getPendingMembers,
  approveMember,
  getMemberHistory,
  getActiveMembers,
  deactivateMember,
  getMemberById,
};