
const mongoose = require("mongoose");

const habitCompletionSchema = new mongoose.Schema(
    {
        habitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Habit",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        completed: {
            type: Boolean,
            default: true
        },

        completedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate completion records for the same habit on the same date
habitCompletionSchema.index(
    { habitId: 1, date: 1 },
    { unique: true }
);

// Create the model
const HabitCompletion = mongoose.model(
    "HabitCompletion",
    habitCompletionSchema
);

module.exports = HabitCompletion;


