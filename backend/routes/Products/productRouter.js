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

// Public routes
productRouter.get("/all", getAllProducts);
productRouter.get("/search", searchProducts);
productRouter.get("/category/:category", getProductsByCategory);
productRouter.get("/:id", getProductById);

// Protected routes
productRouter.use(protect);
productRouter.post("/create", createProduct);
productRouter.get("/own", getOwnProducts);
productRouter.delete("/delete/:id", deleteProduct);
productRouter.put("/update/:id", updateProduct);

export default productRouter;