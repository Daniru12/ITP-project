import express from "express";
// Import controller functions
import { 
  createOrder, 
  createOrderFromCart, 
  getOwnOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from "../../controller/ProductsCRUD/OrderController.js";
import { protect } from "../../middleware/authMiddleware.js"; // Import the protect middleware

const orderRouter = express.Router();

// Protect all order routes
orderRouter.use(protect);

// Routes
orderRouter.post("/create", createOrder);
orderRouter.post("/create-from-cart", createOrderFromCart);
orderRouter.get("/my-orders", getOwnOrders);  // Make sure this matches your frontend call
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id/status", updateOrderStatus);
orderRouter.post('/:id/cancel', cancelOrder);

export default orderRouter;