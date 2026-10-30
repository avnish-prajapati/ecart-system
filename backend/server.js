//starting points of any backend things.....

// models: what data looks like
// controllers: what happens when a request comes
// routes: which URL calls which controller
// middleware: guards that check the token or role before the controller runs

import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express(); // your app create (waiter like)

connectDB(); // always connect the database first

// CORS lets the React app (another port) talk to this server
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json()); // lets the server understand JSON data sent to it

app.get("/", (req, res) => {
    res.send("server running !");
});

// every route group gets its own starting URL
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// if no route matched, reply with 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000; // reads PORT from .env. If missing, use 5000
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

// do these whenever u go blank to write a code
// Import (require express)
// Create (const app = express())
// Use / Routes (app.use, app.get)
// Listen (app.listen)
