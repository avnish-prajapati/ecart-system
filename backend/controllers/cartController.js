//  ← cart logic (user side CRUD + filter + pagination)
// Every function here runs after verifyToken, so req.user.id is always the logged-in user.
// We always search with { user: req.user.id }, so a user can never touch another user's cart.

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// READ  ->  GET /api/cart
export const getCart = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 50);
        const { category } = req.query;

        const filter = { user: req.user.id };

        // FILTER by category: first find the ids of products in that category,
        // then keep only the cart rows whose product is in that list
        if (category) {
            const ids = await Product.distinct("_id", { category });
            filter.product = { $in: ids };
        }

        const total = await Cart.countDocuments(filter);
        const items = await Cart.find(filter)
            .populate("product") // replace the product id with the full product details
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Cart total = price x quantity of ALL cart items 
        const all = await Cart.find({ user: req.user.id }).populate("product");
        const cartTotal = all.reduce((sum, item) => {
            return item.product ? sum + item.product.price * item.quantity : sum;
        }, 0);

        res.json({ items, page, total, totalPages: Math.ceil(total / limit), cartTotal });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE  ->  POST /api/cart     
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // is this product already in this user's cart?
        const item = await Cart.findOne({ user: req.user.id, product: productId });
        const newQty = (item ? item.quantity : 0) + Number(quantity);

        // never allow more than what is in stock
        if (newQty > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} left in stock` });
        }

        if (item) {
            item.quantity = newQty;      // already there -> just increase the quantity
            await item.save();
            return res.json(item);
        }

        const created = await Cart.create({ user: req.user.id, product: productId, quantity: newQty });
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE  ->  PUT /api/cart/:id     body: { quantity }
export const updateCartItem = async (req, res) => {
    try {
        const quantity = Number(req.body.quantity);
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        // searching with BOTH id and user makes sure it is this user's own item
        const item = await Cart.findOne({ _id: req.params.id, user: req.user.id }).populate("product");
        if (!item) return res.status(404).json({ message: "Cart item not found" });

        if (quantity > item.product.stock) {
            return res.status(400).json({ message: `Only ${item.product.stock} left in stock` });
        }

        item.quantity = quantity;
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE  ->  DELETE /api/cart/:id
export const removeCartItem = async (req, res) => {
    try {
        const item = await Cart.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!item) return res.status(404).json({ message: "Cart item not found" });
        res.json({ message: "Removed from cart" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
