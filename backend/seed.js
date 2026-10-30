
import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Cart from "./models/Cart.js";

await connectDB();


const email = process.env.ADMIN_EMAIL || "admin@ecart.com";
const exists = await User.findOne({ email });

if (exists) {
    console.log("Admin already exists:", email);
} else {
    await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10),
        role: "admin",
    });
    console.log("Admin created:", email);
}



const COLORS = {
    Shoes: "0b6e6e",
    Clothes: "7a3e9d",
    Electronics: "1f4e9c",
    Home: "a65d1c",
    Books: "8a2b3a",
    Sports: "2e7d32",
};

const make = (name, price, category, stock) => ({
    name,
    price,
    category,
    stock,
    image: `https://placehold.co/400x300/${COLORS[category]}/ffffff?text=${encodeURIComponent(name)}`,
});

const products = [
    // Shoes
    make("Running Shoes", 2499, "Shoes", 15),
    make("Leather Sandals", 899, "Shoes", 20),
    make("Canvas Sneakers", 1299, "Shoes", 25),
    make("Formal Black Shoes", 1899, "Shoes", 12),

    // Clothes
    make("Classic T-Shirt", 499, "Clothes", 40),
    make("Denim Jacket", 1999, "Clothes", 10),
    make("Cotton Hoodie", 1199, "Clothes", 18),
    make("Slim Fit Jeans", 1499, "Clothes", 22),

    // Electronics
    make("Wireless Earbuds", 1499, "Electronics", 25),
    make("Power Bank 10000mAh", 999, "Electronics", 30),
    make("Bluetooth Speaker", 1799, "Electronics", 14),
    make("Smart Watch", 2999, "Electronics", 9),

    // Home
    make("Steel Water Bottle", 349, "Home", 50),
    make("Study Lamp", 699, "Home", 12),
    make("Cotton Bedsheet", 799, "Home", 16),
    make("Wall Clock", 449, "Home", 20),

    // Books
    make("Learn JavaScript", 599, "Books", 30),
    make("Node.js Handbook", 649, "Books", 18),
    make("Python for Beginners", 549, "Books", 24),
    make("Database Basics", 499, "Books", 15),

    // Sports
    make("Football", 799, "Sports", 20),
    make("Yoga Mat", 599, "Sports", 28),
    make("Badminton Racket", 1099, "Sports", 11),
    make("Skipping Rope", 199, "Sports", 45),
];


await Cart.deleteMany({});
await Product.deleteMany({});
await Product.insertMany(products);
console.log(`${products.length} products added in ${Object.keys(COLORS).length} categories`);

await mongoose.connection.close();
process.exit(0);