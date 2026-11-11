
const Habit = require("../models/Habit");
const HabitCompletion = require("../models/HabitCompletion");

// Mark a habit as completed
const createCheckIn = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body || {};

        // Check whether the habit exists and is active
        const habit = await Habit.findOne({
            _id: id,
            isActive: true
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Active habit not found"
            });
        }

        // Use today's date if no date is provided
        const selectedDate = date ? new Date(date) : new Date();

        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date"
            });
        }

        // Normalize date to midnight UTC
        selectedDate.setUTCHours(0, 0, 0, 0);

        // Create or update the completion record
        const checkIn = await HabitCompletion.findOneAndUpdate(
            {
                habitId: id,
                date: selectedDate
            },
            {
                $set: {
                    completed: true,
                    completedAt: new Date()
                },
                $setOnInsert: {
                    habitId: id,
                    date: selectedDate
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Habit marked as completed",
            data: checkIn
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid habit ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to mark habit as completed"
        });
    }
};

// Get completion history of a habit
const getCheckInHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether the habit exists
        const habit = await Habit.findById(id);

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        // Fetch all completion records for this habit
        const history = await HabitCompletion.find({
            habitId: id
        }).sort({ date: -1 });

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid habit ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch check-in history"
        });
    }
};

// Undo a habit check-in
const undoCheckIn = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body || {};

        // Check whether the habit exists
        const habit = await Habit.findOne({
            _id: id,
            isActive: true
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Active habit not found"
            });
        }

        // Validate the date
        const selectedDate = date ? new Date(date) : new Date();

        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date"
            });
        }

        selectedDate.setUTCHours(0, 0, 0, 0);

        // Mark the completion as false
        const checkIn = await HabitCompletion.findOneAndUpdate(
            {
                habitId: id,
                date: selectedDate
            },
            {
                $set: {
                    completed: false
                }
            },
            {
                new: true
            }
        );

        if (!checkIn) {
            return res.status(404).json({
                success: false,
                message: "No check-in found for this date"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Habit check-in undone successfully",
            data: checkIn
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid habit ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to undo check-in"
        });
    }
};

// Get today's check-ins for all active habits
const getTodayCheckIns = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const habits = await Habit.find({
            isActive: true
        }).select("_id");

        const habitIds = habits.map(habit => habit._id);

        const checkIns = await HabitCompletion.find({
            habitId: { $in: habitIds },
            date: today,
            completed: true
        });

        return res.status(200).json({
            success: true,
            data: checkIns
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch today's check-ins"
        });
    }
};

module.exports = {
    createCheckIn,
    getCheckInHistory,
    undoCheckIn,
    getTodayCheckIns
};
