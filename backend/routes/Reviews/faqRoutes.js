import express from "express";
import {
  addFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
  addFaqAnswer,
  confirmAnswer,
  deleteFaq,
} from "../../controller/Reviews_and_Ratings/faqController.js";

import { protect } from "../../middleware/authMiddleware.js"; 

const faqRouter = express.Router();

faqRouter.post("/create", protect, addFaq);
faqRouter.get("/all", protect,getAllFaqs);
faqRouter.get("/:faqId", protect,getFaqById);
faqRouter.put("/update/:faqId", protect, updateFaq);
faqRouter.put("/updateAns/:faqId", protect, addFaqAnswer);
faqRouter.put("/confirmAns/:faqId", protect, confirmAnswer);
faqRouter.delete("/delete/:faqId", protect, deleteFaq);

export default faqRouter;
