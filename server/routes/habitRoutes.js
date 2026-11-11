
const express = require("express");

const router = express.Router();

const {
    createHabit,
    getHabits,
    updateHabit,
    deleteHabit
} = require("../controllers/habitController");

// Create a habit
router.post("/", createHabit);

// Get all active habits
router.get("/", getHabits);

// Update an existing habit
router.put("/:id", updateHabit);

// Soft delete a habit
router.delete("/:id", deleteHabit);

module.exports = router;


