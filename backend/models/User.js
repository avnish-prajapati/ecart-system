// ← what a USER looks like in the database


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // no two users can share one email
    password: { type: String, required: true },            // always saved as a bcrypt HASH, never plain text
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Used only for "forgot password". We save the OTP as a hash too, with an expiry time.
    resetOtp: { type: String },
    resetOtpExpire: { type: Date },
}, {
    timestamps: true // adds createdAt and updatedAt automatically
});

export default mongoose.model("User", userSchema);
