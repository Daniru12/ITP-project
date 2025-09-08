import Faq from "../../models/Reviews/faqall.js";
import User from "../../models/User.js";

// ✅ Add a new FAQ (Any user can ask a question)
export const addFaq = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const newFaq = new Faq({
      user: req.user ? req.user._id : null, // User is optional
      question,
    });

    await newFaq.save();
    res.status(201).json({ message: "FAQ added successfully", faq: newFaq });
  } catch (error) {
    res.status(500).json({ message: "Error adding FAQ", error: error.message });
  }
};

// ✅ Get all FAQs (Anyone can view)
export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().populate("user", "name email");
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching FAQs", error: error.message });
  }
};

// ✅ Get a specific FAQ by ID
export const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.faqId).populate("user", "name email");

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: "Error fetching FAQ", error: error.message });
  }
};

// ✅ Update a FAQ question (Only question owner can update)
export const updateFaq = async (req, res) => {
  try {
    const { question } = req.body;
    const faq = await Faq.findById(req.params.faqId);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    // Check if the user is the owner of the question
    if (faq.user && faq.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own questions" });
    }

    faq.question = question || faq.question;
    await faq.save();
    res.status(200).json({ message: "FAQ updated successfully", faq });
  } catch (error) {
    res.status(500).json({ message: "Error updating FAQ", error: error.message });
  }
};

// ✅ Add or update an answer (Any user can answer)
export const addOrUpdateAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const faq = await Faq.findById(req.params.faqId);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    faq.answer = answer || faq.answer;
    await faq.save();
    res.status(200).json({ message: "Answer added/updated successfully", faq });
  } catch (error) {
    res.status(500).json({ message: "Error updating answer", error: error.message });
  }
};

// ✅ Delete a FAQ (Only admin or service provider can delete)
export const deleteFaq = async (req, res) => {
  try {
    const { user_type } = req.user; // Assuming user_type is available in req.user
    const faq = await Faq.findById(req.params.faqId);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    if (user_type !== "admin" && user_type !== "service_provider") {
      return res.status(403).json({ message: "Only an admin or service provider can delete FAQs" });
    }

    await faq.deleteOne();
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting FAQ", error: error.message });
  }
};
