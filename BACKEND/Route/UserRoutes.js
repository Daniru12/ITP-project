const express = require("express");
const router = express.Router();

// Import User Controller
const UserController = require("../Controlers/UserController");
const UserRegister = require("../Controlers/UserRegister");
const UserLogin = require("../Controlers/UserLogin");

// Define Routes
router.get("/", UserController.getAllUsers);
router.post("/add", UserController.addUsers);
router.get("/:id",UserController.getById);
router.put("/update/:id",UserController.updateUser);
router.delete("/delete/:id",UserController.deleteUser);
router.post("/register",UserRegister.RegisterUsers);
router.post("/login",UserLogin.LoginUsers);
module.exports = router;
