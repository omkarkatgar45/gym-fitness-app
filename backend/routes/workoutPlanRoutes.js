const express = require("express");

const {
  createWorkoutPlan,
  getMemberWorkoutPlans,
  getTrainerWorkoutPlans,
} = require("../controllers/workoutPlanController");

const router = express.Router();

// Create workout plan
router.post("/", createWorkoutPlan);

// Get workout plans for member
router.get("/member/:memberId", getMemberWorkoutPlans);

// Get workout plans created by trainer
router.get("/trainer/:trainerId", getTrainerWorkoutPlans);

module.exports = router;