const { pool } = require("../config/db");

// =====================================================
// CREATE WORKOUT PLAN
// =====================================================

const createWorkoutPlan = async (req, res) => {
  try {
    const {
      trainerId,
      memberId,
      planTitle,
      exercises,
      notes,
      startDate,
      endDate,
    } = req.body;

    if (!trainerId || !memberId || !planTitle || !exercises) {
      return res.status(400).json({
        success: false,
        message:
          "Trainer ID, Member ID, Plan Title and Exercises are required.",
      });
    }

    // Check active trainer
    const [trainerRows] = await pool.query(
      `
      SELECT
        t.id AS trainer_id,
        t.user_id,
        u.full_name AS trainer_name
      FROM trainers t
      INNER JOIN users u ON u.id = t.user_id
      WHERE t.user_id = ?
        AND t.trainer_status = 'active'
        AND u.role_id = 3
        AND u.status = 'active'
      LIMIT 1
      `,
      [trainerId]
    );

    if (trainerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active trainer profile not found.",
      });
    }

    const trainer = trainerRows[0];

    // Check active member
    const [memberRows] = await pool.query(
      `
      SELECT
        m.id AS member_id,
        u.full_name AS member_name
      FROM members m
      INNER JOIN users u ON u.id = m.user_id
      WHERE m.id = ?
        AND u.status = 'active'
      LIMIT 1
      `,
      [memberId]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active member not found.",
      });
    }

    const member = memberRows[0];

    // Validate dates when both are supplied
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO workout_plans
      (
        trainer_id,
        member_id,
        plan_title,
        exercises,
        notes,
        start_date,
        end_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        trainer.trainer_id,
        member.member_id,
        planTitle.trim(),
        exercises.trim(),
        notes ? notes.trim() : null,
        startDate || null,
        endDate || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Workout plan created successfully.",
      workoutPlan: {
        id: result.insertId,
        trainer_id: trainer.trainer_id,
        trainer_name: trainer.trainer_name,
        member_id: member.member_id,
        member_name: member.member_name,
        plan_title: planTitle.trim(),
        exercises: exercises.trim(),
        notes: notes ? notes.trim() : null,
        start_date: startDate || null,
        end_date: endDate || null,
      },
    });
  } catch (error) {
    console.error("Create workout plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create workout plan.",
    });
  }
};


// =====================================================
// GET WORKOUT PLANS FOR MEMBER
// =====================================================

const getMemberWorkoutPlans = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId || Number(memberId) < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid Member ID is required.",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        wp.id,
        wp.trainer_id,
        wp.member_id,
        wp.plan_title,
        wp.exercises,
        wp.notes,
        wp.start_date,
        wp.end_date,
        wp.created_at,
        u.full_name AS trainer_name
      FROM workout_plans wp
      INNER JOIN trainers t ON t.id = wp.trainer_id
      INNER JOIN users u ON u.id = t.user_id
      WHERE wp.member_id = ?
      ORDER BY wp.created_at DESC
      `,
      [Number(memberId)]
    );

    return res.status(200).json({
      success: true,
      workoutPlans: rows,
    });
  } catch (error) {
    console.error("Get member workout plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load workout plans.",
    });
  }
};


// =====================================================
// GET WORKOUT PLANS FOR TRAINER
// =====================================================

const getTrainerWorkoutPlans = async (req, res) => {
  try {
    const { trainerId } = req.params;

    if (!trainerId || Number(trainerId) < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid Trainer ID is required.",
      });
    }

    const [trainerRows] = await pool.query(
      `
      SELECT id
      FROM trainers
      WHERE user_id = ?
        AND trainer_status = 'active'
      LIMIT 1
      `,
      [Number(trainerId)]
    );

    if (trainerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active trainer profile not found.",
      });
    }

    const trainerDbId = trainerRows[0].id;

    const [rows] = await pool.query(
      `
      SELECT
        wp.id,
        wp.trainer_id,
        wp.member_id,
        wp.plan_title,
        wp.exercises,
        wp.notes,
        wp.start_date,
        wp.end_date,
        wp.created_at,
        u.full_name AS member_name
      FROM workout_plans wp
      INNER JOIN members m ON m.id = wp.member_id
      INNER JOIN users u ON u.id = m.user_id
      WHERE wp.trainer_id = ?
      ORDER BY wp.created_at DESC
      `,
      [trainerDbId]
    );

    return res.status(200).json({
      success: true,
      workoutPlans: rows,
    });
  } catch (error) {
    console.error("Get trainer workout plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load trainer workout plans.",
    });
  }
};


module.exports = {
  createWorkoutPlan,
  getMemberWorkoutPlans,
  getTrainerWorkoutPlans,
};