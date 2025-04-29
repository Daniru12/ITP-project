import Order from "../../models/Products/order.js";
import Cart from "../../models/Products/cart.js";
import Product from "../../models/Products/Product.js";

// Create a new order directly
export const createOrder = async (req, res) => {
  try {
    const { products, shipping_details } = req.body;

    // Calculate total price
    let total_price = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      
      // Check if enough quantity is available
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough quantity available for ${product.name}` 
        });
      }
      
      total_price += product.price * item.quantity;
    }

    const newOrder = new Order({
      products: products.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      total_price,
      pet_owner: req.user._id,
      shipping_details,
      order_status: "Pending"
    });

    const savedOrder = await newOrder.save();

    // Update product quantities
    for (const item of products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity } }
      );
    }

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

// Create order from cart
export const createOrderFromCart = async (req, res) => {
  try {
    const { shipping_details } = req.body;
    const userId = req.user._id;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total and prepare products array
    let total_price = 0;
    const products = [];

    for (const item of cart.items) {
      const product = item.product;
      
      // Check if enough quantity is available
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough quantity available for ${product.name}` 
        });
      }

      total_price += product.price * item.quantity;
      products.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create new order
    const newOrder = new Order({
      products,
      total_price,
      pet_owner: userId,
      shipping_details,
      order_status: "Pending"
    });

    const savedOrder = await newOrder.save();

    // Update product quantities and clear cart
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear the cart
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Error creating order from cart:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

// Get user's own orders
export const getOwnOrders = async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user._id); // Debug log

    const orders = await Order.find({ pet_owner: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name price image' // Select the fields you need
      })
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders); // Debug log

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      message: "Error fetching orders",
      error: error.message 
    });
  }
};

// Get specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product')
      .populate('pet_owner', 'username email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (order.pet_owner._id.toString() !== req.user._id.toString() && 
        req.user.user_type !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only admin can update order status
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update order status" });
    }

    order.order_status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
};

// Update the cancelOrder controller
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.pet_owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // Check if order is within 24 hours
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDifference = (now - orderDate) / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      return res.status(400).json({ 
        message: "Orders can only be cancelled within 24 hours of placing" 
      });
    }

    // Restore product quantities
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: item.quantity } }
      );
    }

    // Delete the order instead of updating status
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      message: "Order cancelled and deleted successfully"
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};

// Get orders for service providers (orders containing their products)
export const getProviderOrders = async (req, res) => {
  try {
    const providerId = req.user._id;
    console.log('Provider ID:', providerId);
    console.log('User type:', req.user.user_type);
    
    // First, find all products by this provider
    const providerProducts = await Product.find({ serviceProvider: providerId });
    console.log('Provider products found:', providerProducts.length);
    
    if (!providerProducts.length) {
      return res.status(200).json({
        orders: [],
        stats: {
          total: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          totalRevenue: 0
        }
      });
    }

    // Get product IDs
    const productIds = providerProducts.map(product => product._id);
    
    // Find orders containing any of these products
    const orders = await Order.find({
      'products.product': { $in: productIds }
    })
    .populate({
      path: 'products.product',
      select: 'name price image serviceProvider'
    })
    .populate('pet_owner', 'username email')
    .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);

    // Calculate stats with null checks
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.order_status === 'Pending').length,
      processing: orders.filter(o => o.order_status === 'Processing').length,
      shipped: orders.filter(o => o.order_status === 'Shipped').length,
      delivered: orders.filter(o => o.order_status === 'Delivered').length,
      totalRevenue: orders.reduce((sum, order) => {
        // Only count revenue from this provider's products
        const providerRevenue = order.products
          .filter(item => item.product && productIds.includes(item.product._id))
          .reduce((total, item) => total + (item.price * item.quantity), 0);
        return sum + providerRevenue;
      }, 0)
    };

    res.status(200).json({
      orders,
      stats
    });
  } catch (error) {
    console.error("Error fetching provider orders:", error);
    res.status(500).json({ 
      message: "Error fetching orders",
      error: error.message,
      stack: error.stack
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view all orders" });
    }

    const orders = await Order.find()
      .populate({
        path: 'products.product',
        select: 'name price image'
      })
      .populate('pet_owner', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ 
      message: "Error fetching orders",
      error: error.message 
    });
  }
};
