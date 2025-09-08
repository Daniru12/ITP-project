import mongoose from "mongoose";
import Service from "../../models/Service.js"; // Import Groomer mode
import Pet from "../../models/Pets.js"; // Import Pet model
import Appointment from "../../models/BookingScheduling/Appointment.js"; // Import Appointment model

const GroomingSchema = new mongoose.Schema(
    {
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
        appointment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: [true, "Appointment is required"],
        },
        Period: {
            type: String,
            enum: ["30min", "1hour", "2hours", "custom"],
            default: "1hour",
        },
        start_time: {
            type: Date,
            required: [true, "Start time is required"],
        },
        end_time: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["Scheduled", "In Progress", "Completed", "Canceled"],
            default: "Scheduled",
        },
        special_requests: {
            type: String,
            default: "",
        },
        notes: {
            type: String,
            default: "",
        }
    },
    { timestamps: true }
);

// Middleware to **automatically calculate end_time** based on duration
GroomingSchema.pre("save", function (next) {
    if (this.start_time) {
        let endTime = new Date(this.start_time);
        switch (this.Period) {
            case "30min":
                endTime.setMinutes(endTime.getMinutes() + 30);
                break;
            case "1hour":
                endTime.setHours(endTime.getHours() + 1);
                break;
            case "2hours":
                endTime.setHours(endTime.getHours() + 2);
                break;
            default:
                if (!this.end_time) {
                    throw new Error("Custom duration must have an end time.");
                }
                break;
        }
        this.end_time = endTime;
    }
    next();
});

const Grooming = mongoose.model("Grooming", GroomingSchema);

export default Grooming;
