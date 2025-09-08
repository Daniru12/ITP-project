import express from "express";
//import controller functions
import { 
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  getOwnProducts,
  searchProducts,
  getProductsByCategory
} from "../../controller/ProductsCRUD/productsContoller.js";
import { protect } from "../../middleware/authMiddleware.js"; // Import the protect middleware

const productRouter = express.Router();

// Public routes (no authentication required)
productRouter.get("/all", getAllProducts);
productRouter.get("/search", searchProducts);
productRouter.get("/category/:category", getProductsByCategory);
productRouter.get("/details/:id", getProductById); // Public route for product details

// Protected routes (authentication required)
productRouter.use(protect); // Apply auth middleware to all routes below this

// Get own products and management routes
productRouter.get("/own", getOwnProducts);
productRouter.get("/management/:id", getProductById); // Protected route for product management

// Protected CRUD operations
productRouter.post("/create", createProduct);
productRouter.put("/update/:id", updateProduct);
productRouter.delete("/delete/:id", deleteProduct);

export default productRouter;