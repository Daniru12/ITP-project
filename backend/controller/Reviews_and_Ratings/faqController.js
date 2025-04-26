import Faq from "../../models/Reviews/faq.js";
import User from "../../models/User.js";

// ✅ Add a new FAQ
export const addFaq = async (req, res) => {
  try {
    const { question, category } = req.body; // Make sure to get the category from the body
    const userId = req.user?._id;

    // Ensure category is not empty
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Create a new FAQ
    const newFaq = new Faq({
      question,
      category, // Now category is properly used
      user: userId || null,
      approved: false,
    });

    // Save to database
    await newFaq.save();

    res.status(201).json({ message: "FAQ added successfully", faq: newFaq });
  } catch (error) {
    res.status(500).json({ message: "Error adding FAQ", error: error.message });
  }
};


// ✅ Get all FAQs (Only approved FAQs for users, all for admins)
export const getAllFaqs = async (req, res) => {
  try {
    const userRole = req.user?.user_type;
    

    let faqs;
    if (userRole === "admin") {
      // Admin can fetch all FAQs including unapproved ones
      faqs = await Faq.find().populate("user", "name");
      
    } else {
      // Users can only see approved FAQs
      faqs = await Faq.find({ approved: true }).populate("user", "name");
      
    }

    if (!faqs.length) {
      console.log("No FAQs found in DB.");
    }

    res.status(200).json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ message: "Error fetching FAQs", error: error.message });
  }
};

// ✅ Get a single FAQ by ID
export const getFaqById = async (req, res) => {
  try {
    const { faqId } = req.params;
    const faq = await Faq.findById(faqId).populate("user", "name");

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({ message: "Error fetching FAQ", error: error.message });
  }
};

// ✅ Update an FAQ (Only the user who created it can update it)
export const updateFaq = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { question } = req.body;
    const userId = req.user?._id;

    // Find the FAQ
    const existingFaq = await Faq.findById(faqId);
    if (!existingFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    // Check if the user is the owner
    if (existingFaq.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own FAQ." });
    }

    // Update the question
    existingFaq.question = question || existingFaq.question;
    await existingFaq.save();

    res.status(200).json({ message: "FAQ updated successfully", faq: existingFaq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ message: "Error updating FAQ", error: error.message });
  }
};

// ✅ Add an answer to an FAQ (Only admins can add answers)
export const addFaqAnswer = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { answer } = req.body;
    const userRole = req.user?.user_type;

    // Check if the user is an admin
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only admins can add answers." });
    }

    // Find the FAQ
    const faq = await Faq.findById(faqId);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    // Update the answer
    faq.answer = answer;
    faq.approved = true; // Mark FAQ as approved when answered by admin
    await faq.save();

    res.status(200).json({ message: "Answer added successfully", faq });
  } catch (error) {
    console.error("Error adding answer:", error);
    res.status(500).json({ message: "Error adding answer", error: error.message });
  }
};

// ✅ Confirm that the answer to an FAQ is provided
export const confirmAnswer = async (req, res) => {
  try {
    const { faqId } = req.params;
    const userRole = req.user?.user_type;

    // Check if the user is an admin
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only admins can confirm answers." });
    }

    // Find the FAQ
    const faq = await Faq.findById(faqId);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    // Confirm the FAQ's answer
    faq.approved = true;
    await faq.save();

    res.status(200).json({ message: "FAQ confirmed", faq });
  } catch (error) {
    console.error("Error confirming FAQ:", error);
    res.status(500).json({ message: "Error confirming FAQ", error: error.message });
  }
};

// ✅ Delete an FAQ (Only admin and service provider can delete it)
export const deleteFaq = async (req, res) => {
  try {
    const { faqId } = req.params;
    const userRole = req.user?.user_type;

    if (userRole !== "admin" && userRole !== "service_provider") {
      return res.status(403).json({ message: "Unauthorized: Only admin and service providers can delete FAQs." });
    }

    const deletedFaq = await Faq.findByIdAndDelete(faqId);
    if (!deletedFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ message: "Error deleting FAQ", error: error.message });
  }
};
