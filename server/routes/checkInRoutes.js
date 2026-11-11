const express = require("express");

const router = express.Router();

const {
    createCheckIn, 
    getCheckInHistory,
    undoCheckIn,
    getTodayCheckIns
} = require("../controllers/checkInController");

// Mark a habit as completed
router.post("/:id", createCheckIn);

// Get check-in history for a habit
router.get("/:id/history", getCheckInHistory);

// Undo a habit check-in
router.patch("/:id/check-in", undoCheckIn);

// Get today's completed habits
router.get("/today", getTodayCheckIns);

module.exports = router;
