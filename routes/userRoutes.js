const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/userValidator");
const { register, verify, loginUser, getUsers } = require("../controllers/userController");

router.post("/register", register);

router.post("/verify-otp", verify);

router.post("/login", loginUser);

router.get("/get", authenticateToken, getUsers)

module.exports = router;
