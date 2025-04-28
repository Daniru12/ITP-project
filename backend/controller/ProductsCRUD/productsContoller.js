import Product from "../../models/Products/Product.js";
import User from "../../models/User.js"; //User model

// Create Product 
export const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    quantity,
    category,
    image,
    serviceProviderId,
    promo_code_applied,
  } = req.body;

  try {
    // Check user
    if (req.user.type !== "admin" && req.user.user_type !== "service_provider") {
      return res.status(403).json({ message: "Access denied. Only admins and service providers can create products." });
    }

    // Create a new product
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      category,
      image,
      serviceProvider: req.user._id, //logged Sprovider id
      promo_code_applied,
    });

    // Save database
    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "Product created successfully!",
      product: savedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, unable to create product." });
  }
};

// Retrieve All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("serviceProvider", "username email"); // Populate service provider details

    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ message: "Server error, unable to retrieve products." });
  }
};

// Retrieve a Single Product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(req.params.id).populate("serviceProvider", "username email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ message: "Server error, unable to retrieve product." });
  }
};

// Delete a Product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Find by ID
    const product = await Product.findById(id);

    
    if (!product) {                                                    // Check product exists
      return res.status(404).json({ message: "Product not found" }); 
    }

    // Check if the user admin or sprovider
    if (req.user.user_type === "admin" || req.user.user_type === "service_provider") {
      
      
      if (req.user.user_type === "service_provider" && product.serviceProvider.toString() !== req.user._id.toString()) {    // check Sprovider owns the product
        return res.status(403).json({ message: "Access denied. You can only delete your own product." });
      }

      // Delete the product 
      await Product.findByIdAndDelete(id);

      res.status(200).json({ message: "Product deleted successfully" });

    } else {
      // If the user pet owner
      return res.status(403).json({ message: "Access denied. Only admins or service providers can delete products." });
    }

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error, unable to delete product." });
  }
};

// Update Product 
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity, category, image, promo_code_applied } = req.body;

  try {
    const product = await Product.findById(id);

    // Check if product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    
    if (req.user.user_type !== "admin" && req.user.user_type !== "service_provider") {
      return res.status(403).json({ message: "Access denied. Only admins or service providers can update products." });
    }

    
    if (req.user.user_type === "service_provider" && product.serviceProvider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You can only update your own product." });
    }

    // Update product data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        quantity,
        category,
        image: image || product.image, // Keep existing image if no new one is provided
        promo_code_applied: promo_code_applied || product.promo_code_applied, // Keep existing promo code status if not updated
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Error updating product",
      error: error.message
    });
  }
};

// Retrieve Products for a Specific Service Provider (Own Products)
export const getOwnProducts = async (req, res) => {
  try {
    const serviceProviderId = req.user._id; // Assuming the service provider's ID is stored in the token

    const products = await Product.find({ serviceProvider: serviceProviderId });

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving own products:", error);
    res.status(500).json({ message: "Server error, unable to retrieve products." });
  }
};

// Search products by name or description
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    }).populate("serviceProvider", "username email");

    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Server error, unable to search products." });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category })
      .populate("serviceProvider", "username email");

    if (!products.length) {
      return res.status(404).json({ 
        message: `No products found in category: ${category}` 
      });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products by category:", error);
    res.status(500).json({ 
      message: "Server error, unable to get products by category." 
    });
  }
};

// Add validation to check product quantity before adding to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Check if product exists and has enough quantity
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ 
        message: "Not enough product quantity available",
        availableQuantity: product.quantity 
      });
    }

    // ... rest of add to cart logic ...

  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding product to cart" });
  }
};