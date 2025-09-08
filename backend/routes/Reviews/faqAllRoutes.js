import express from "express";
import {
  addFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
  addOrUpdateAnswer,
  deleteFaq,
} from "../../controller/Reviews_and_Ratings/faqAllController.js";

import { protect } from "../../middleware/authMiddleware.js";

const faqAllRouter = express.Router();

faqAllRouter.post("/create", protect, addFaq);
faqAllRouter.get("/all", getAllFaqs);
faqAllRouter.get("/:faqId", getFaqById);
faqAllRouter.put("/update/:faqId", protect, updateFaq);
faqAllRouter.put("/answer/:faqId", protect, addOrUpdateAnswer);
faqAllRouter.delete("/delete/:faqId", protect, deleteFaq);

export default faqAllRouter;
