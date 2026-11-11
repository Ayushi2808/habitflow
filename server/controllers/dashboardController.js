const Habit = require("../models/Habit");
const HabitCompletion = require("../models/HabitCompletion");

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
    try {
        // Get the selected date or use today
        const selectedDate = req.query.date
            ? new Date(req.query.date)
            : new Date();

        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date"
            });
        }

        selectedDate.setUTCHours(0, 0, 0, 0);

        // Get all active habits
        const habits = await Habit.find({
            isActive: true
        }).select("_id");

        const totalHabits = habits.length;

        // Extract habit IDs
        const habitIds = habits.map(habit => habit._id);

        // Count completed habits for the selected date
        const completedHabits = await HabitCompletion.countDocuments({
            habitId: { $in: habitIds },
            date: selectedDate,
            completed: true
        });

        const pendingHabits = totalHabits - completedHabits;

        const completionPercentage = totalHabits === 0
            ? 0
            : Math.round((completedHabits / totalHabits) * 100);

        return res.status(200).json({
            success: true,
            data: {
                totalHabits,
                completedHabits,
                pendingHabits,
                completionPercentage
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard summary"
        });
    }
};

// Get weekly progress for the last 7 days
const getWeeklyProgress = async (req, res) => {
    try {
        const endDate = new Date();

        // Set today's date to midnight UTC
        endDate.setUTCHours(0, 0, 0, 0);

        // Calculate the date 6 days before today
        const startDate = new Date(endDate);
        startDate.setUTCDate(startDate.getUTCDate() - 6);

        // Get all active habits
        const habits = await Habit.find({
            isActive: true
        }).select("_id");

        const habitIds = habits.map(habit => habit._id);

        // Get completed check-ins for the last 7 days
        const completions = await HabitCompletion.find({
            habitId: { $in: habitIds },
            date: {
                $gte: startDate,
                $lte: endDate
            },
            completed: true
        }).select("date");

        // Prepare progress for all 7 days
        const weeklyProgress = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setUTCDate(startDate.getUTCDate() + i);

            const completedCount = completions.filter(completion => {
                return completion.date.getTime() === currentDate.getTime();
            }).length;

            weeklyProgress.push({
                date: currentDate.toISOString().split("T")[0],
                completedHabits: completedCount
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                totalHabits: habits.length,
                weeklyProgress
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch weekly progress"
        });
    }
};

module.exports = {
    getDashboardSummary,
    getWeeklyProgress
};