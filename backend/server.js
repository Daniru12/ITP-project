import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import groomingRouter from "./routes/Servicess/serviceRouter.js";
import userRouter from "./routes/userRouter.js";
import appointmentRouter from "./routes/AppoimentScheduling/appointmentRouter.js";
import scheduleRouter from "./routes/AppoimentScheduling/schedulingRoutes.js";
import reviewRouter from "./routes/Reviews/reviewRoutes.js"; 
import faqRouter from "./routes/Reviews/faqRoutes.js";
import paymnetRouter from "./routes/Payment/paymentRouter.js";
import AdvertisementRoutes from "./routes/Advertisement/advertisementRouter.js";
import faqAllRouter from "./routes/Reviews/faqAllRoutes.js";
import productRouter from "./routes/Products/productRouter.js";
import orderRouter from "./routes/Products/orderRouter.js";
import petBookRouter from "./routes/petBookRoutes.js";
import cartRouter from "./routes/Products/cartRouter.js";
import promoCodeRoutes from './routes/promoCodeRoutes.js';



dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",  // Make sure to set FRONTEND_URL in .env
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("Mongo URL not set in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

app.use("/api/users", userRouter);
app.use("/api/grooming", groomingRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/scheduling", scheduleRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/faqs", faqRouter);
app.use("/api/payment",paymnetRouter);
app.use("/api/advertisement",AdvertisementRoutes);
app.use("/api/products", productRouter);
app.use("/api/faqAll", faqAllRouter);
app.use("/api/orders", orderRouter);
app.use("/api/petbook", petBookRouter);
app.use("/api/cart", cartRouter);
app.use('/api/promocodes', promoCodeRoutes);

// Add this after your routes but before app.listen
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: "Invalid ID format"
    });
  }

  // Default error response
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});