import mongoose from "mongoose";
import Pet from "../../models/Pets.js"; // Import Pet model

const TrainingScheduleSchema = new mongoose.Schema(
    {
        appointment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: [true, "Appointment ID is required"],
        },
        pet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: [true, "Pet is required"],
        },
        service_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Services",
            required: [true, "Service is required"],
        },
        week_start_date: {
            type: Date,
            required: [true, "Week start date is required"],
        },
        schedule: [
            {
                day: {
                    type: String,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    required: true,
                },
                sessions: [
                    {
                        time: {
                            type: String, // Example: "06:00 AM", "07:00 AM"
                            required: true,
                        },
                        training_type: {
                            type: String,
                            ref: "Service",
                            required: true,
                        },
                        duration: {
                            type: String,
                            enum: ["30min", "1hour", "2hours", "custom"],
                            default: "1hour",
                        },
                        status: {
                            type: String,
                            enum: ["Scheduled", "Completed", "Canceled"],
                            default: "Scheduled",
                        },
                        notes: {
                            type: String,
                            default: "",
                        }
                    }
                ]
            }
        ],
        comments: {
            type: String,
            default: "",
        }
    },
    { timestamps: true }
);

const TrainingSchedule = mongoose.model("TrainingSchedule", TrainingScheduleSchema);

export default TrainingSchedule;
