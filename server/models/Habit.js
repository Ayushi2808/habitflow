const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Habit title is required"],
            trim: true,
            maxlength: 100
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        frequency: {
            type: String,
            enum: ["daily", "weekly"],
            default: "daily"
        },
        color: {
            type: String,
            default: "#6366f1"
        },
        isActive: {
            type: Boolean, 
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Habit = mongoose.model("Habit",habitSchema);
module.exports = Habit;
