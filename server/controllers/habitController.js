// A controller contains the application logic that execute after an API request reaches the corresponding route

const Habit = require("../models/Habit");

// Create a new habit
const createHabit = async (req, res) => {
    try {
        const { title, description, frequency, color } = req.body;

        const habit = await Habit.create({
            title,
            description,
            frequency,
            color
        });

        return res.status(201).json({
            success: true,
            message: "Habit created successfully",
            data: habit
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create habit"
        });
    }
};

// Get all active habits
const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ isActive: true })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: habits.length,
            data: habits
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch habits"
        });
    }
};

// Update an existing habit
const updateHabit = async (req, res) => {
    try {
        const { title, description, frequency, color } = req.body;

        const habit = await Habit.findByIdAndUpdate(
            req.params.id,
            { title, description, frequency, color },
            {
                new: true,
                runValidators: true
            }
        );

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Habit updated successfully",
            data: habit
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid habit ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update habit"
        });
    }
};

// Soft delete a habit
const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Habit deleted successfully",
            data: habit
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
            message: "Failed to delete habit"
        });
    }
};

// Export controller functions
module.exports = {
    createHabit,
    getHabits,
    updateHabit,
    deleteHabit
};
