// ← what a PRODUCT looks like (admin adds these, users see them)

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // Number (not String) because we add and sort prices
    category: { type: String, required: true },
    image: { type: String, default: "" },            // image link, optional
    stock: { type: Number, default: 0, min: 0 },     // how many are left
}, {
    timestamps: true
});

export default mongoose.model("Product", productSchema);
