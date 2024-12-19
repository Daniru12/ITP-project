const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./Route/UserRoutes");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create 'files' directory if it doesn't exist
const filesDir = path.join(__dirname, "files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
  console.log("Created 'files' directory.");
}

// Middleware
app.use(express.json());
app.use(cors());

// Serve files and images
app.use("/files", express.static(path.join(__dirname, "files")));  // Serve all files from the "files" directory
app.use("/images", express.static(path.join(__dirname, "files/images"))); // Serve images from the "files/images" directory

// MongoDB connection
const URL = process.env.MONGODB_URL;
mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connection success!"))
  .catch((err) => console.error("MongoDB Connection failed:", err.message));

// Routes
app.use("/users", userRoutes);

// Register Model
require("./Module/Register");
const User = mongoose.model("register");

// PDF Upload Section
require("./Module/PdfModel");
const pdfSchema = mongoose.model("PdfDetails");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const pdfDir = path.join(filesDir, "pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    cb(null, pdfDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

app.post("/uploadfile", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const pdf = req.file.filename;
  try {
    await pdfSchema.create({ title, pdf });
    res.send({ status: "success", message: "File uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "error", message: "Error uploading file" });
  }
});

app.get("/getFiles", async (req, res) => {
  try {
    const data = await pdfSchema.find({});
    res.send({ status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "error", message: "Error fetching files" });
  }
});

// Import models
const ImgSchema = require("./Module/imgModel");

// Image upload configuration
const storageimg = multer.diskStorage({
  destination: function (req, file, cb) {
    const imgDir = path.join(filesDir, "images");
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }
    cb(null, imgDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const uploadimg = multer({ storage: storageimg });

// API routes for image uploads
app.post("/uploadImg", uploadimg.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "error", message: "No file uploaded" });
  }

  try {
    const savedImage = await ImgSchema.create({ Image: req.file.filename });
    res.json({ status: "success", data: savedImage });
  } catch (error) {
    console.error("Error saving image:", error.message);
    res.status(500).json({ status: "error", message: "Error saving image" });
  }
});

app.get("/getImage", async (req, res) => {
  try {
    const data = await ImgSchema.find({});
    res.json({ status: "success", data });
  } catch (error) {
    console.error("Error fetching images:", error.message);
    res.status(500).json({ status: "error", message: "Error fetching images" });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
