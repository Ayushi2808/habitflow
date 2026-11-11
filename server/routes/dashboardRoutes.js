const express = require("express");

const router = express.Router();

const {
    getDashboardSummary,
    getWeeklyProgress
} = require("../controllers/dashboardController");

// Get dashboard summary
router.get("/summary", getDashboardSummary);

// Get weekly progress
router.get("/weekly-progress", getWeeklyProgress);

module.exports = router;