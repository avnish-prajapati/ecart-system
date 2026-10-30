// ← URLs that point to controllers (cart)

import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cartController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// every cart route needs a token, so we put the guard once for all of them
router.use(verifyToken);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);

export default router;
