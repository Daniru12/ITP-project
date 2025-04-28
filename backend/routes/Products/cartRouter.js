import express from "express";
import { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart 
} from "../../controller/ProductsCRUD/cartController.js";
import { protect } from "../../middleware/authMiddleware.js";

const cartRouter = express.Router();

// Protect all cart routes
cartRouter.use(protect);

cartRouter.post("/add", addToCart);
cartRouter.get("/", getCart);
cartRouter.put("/update", updateCartItem);
cartRouter.delete("/remove/:productId", removeFromCart);

export default cartRouter; 