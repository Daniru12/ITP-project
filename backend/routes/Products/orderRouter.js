import express from "express";
// Import controller functions
import { 
  createOrder, 
  getOwnOrders,
  createOrderFromCart,  // Add this new controller
  getOrderById,
  updateOrderStatus 
} from "../../controller/ProductsCRUD/OrderController.js";
import { protect } from "../../middleware/authMiddleware.js"; // Import the protect middleware

const orderRouter = express.Router();

// Protected routes
orderRouter.use(protect);

// Create a new order (protected route)
orderRouter.post("/create", createOrder);
orderRouter.post("/create-from-cart", createOrderFromCart);  // New route

// Get orders specific to the logged-in user (protected route)
orderRouter.get("/own", getOwnOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id/status", updateOrderStatus);

export default orderRouter;