//  ← product logic: CRUD + pagination + filter

import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// CREATE  ->  POST /api/products   (admin only)
export const createProduct = async (req, res) => {
    try {
        const { name, price, category, image, stock } = req.body;

        if (!name || price === undefined || !category) {
            return res.status(400).json({ message: "Name, price and category are required" });
        }

        const product = await Product.create({ name, price, category, image, stock });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ ALL  ->  GET /api/products?page
// Used by BOTH sides: admin table and user shop.
export const getProducts = async (req, res) => {
    try {
        // PAGINATION: page 1 = first items, page 2 = next items ...
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 50);

        // FILTER: build the search condition step by step
        const { category, search } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (search) {
            // escape special characters, then search the name (case-insensitive)
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.name = { $regex: safe, $options: "i" };
        }

        const total = await Product.countDocuments(filter); // how many match in total
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })        // newest first
            .skip((page - 1) * limit)       // skip the items of earlier pages
            .limit(limit);                  // take only this page's items

        res.json({ products, page, total, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ALL CATEGORIES  ->  GET /api/products/categories   (for the filter dropdown)
export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ ONE  ->  GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE  ->  PUT /api/products/:id   (admin only)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // new: true = give back the updated product
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE  ->  DELETE /api/products/:id   (admin only)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // also remove this product from everyone's cart, so no broken rows are left
        await Cart.deleteMany({ product: req.params.id });

        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
