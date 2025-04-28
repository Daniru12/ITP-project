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
import cartRouter from "./routes/Products/cartRouter.js";


dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  .connect(mongoUrl)
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
app.use("/api/Products", productRouter);
app.use("/api/faqAll", faqAllRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});