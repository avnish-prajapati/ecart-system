// ← URLs that point to controllers (auth)

import express from "express";
import {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    verifyOtp,
    resetPassword,
} from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// POST is used because we SEND data (a password must not appear in the URL)
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// guard in the middle: verifyToken runs first, then getMe
router.get("/me", verifyToken, getMe);

export default router;
