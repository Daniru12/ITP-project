import mongoose from "mongoose";

const faqallSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },

    answer: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

const faq = mongoose.model("QA", faqallSchema);

export default faq;
