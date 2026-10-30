// ← URLs that point to controllers (products)
// Order inside each route:  URL, guard(s), controller

import express from "express";
import {
    createProduct,
    getProducts,
    getCategories,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import verifyToken from "../middleware/verifyToken.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

// Any logged-in person (admin or user) can READ products
router.get("/", verifyToken, getProducts);
router.get("/categories", verifyToken, getCategories); // must stay ABOVE "/:id"
router.get("/:id", verifyToken, getProductById);

// Only the admin can CREATE, UPDATE, DELETE
router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;
