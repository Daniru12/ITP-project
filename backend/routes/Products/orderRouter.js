import express from "express";
// Import controller functions
import { 
  createOrder, 
  createOrderFromCart, 
  getOwnOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getProviderOrders,
  getAllOrders,
  getPetOwnerProductOrders
} from "../../controller/ProductsCRUD/OrderController.js";
import { protect } from "../../middleware/authMiddleware.js"; // Import the protect middleware

const orderRouter = express.Router();

// Protect all routes
orderRouter.use(protect);

// User routes
orderRouter.get("/user/my-orders", getOwnOrders);  // Match frontend route
orderRouter.get("/user/product-orders", getPetOwnerProductOrders);  // Add this new route
orderRouter.get("/provider/orders", getProviderOrders); // Match frontend route
orderRouter.get("/own", getOwnOrders);  // for viewOwnerOrders.jsx
orderRouter.get("/provider/orders", getProviderOrders); // for ProviderOrderManagement.jsx
orderRouter.get("/all", getAllOrders); // For admin

// General routes
orderRouter.post("/create", createOrder);
orderRouter.post("/create-from-cart", createOrderFromCart);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id/status", updateOrderStatus);
orderRouter.post("/:id/cancel", cancelOrder);

export default orderRouter;