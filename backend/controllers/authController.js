//  ← the actual work (logic) for register, login and forgot password

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";


export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // basic checks so we never save empty data
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // check: does a user with this email already exist?
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // hash the password (10 = how strong the scrambling is)
        // A hash can never be turned back into the real password.
        const hashed = await bcrypt.hash(password, 10);

        // save the user. Role is always "user" here. Admin is made with "npm run seed".
        await User.create({ name, email, password: hashed });

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // same message for both mistakes, so hackers can't learn which emails exist
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // compare(typedPassword, savedHash) -> true or false
        // (we can't use === because bcrypt adds a random salt to every hash)
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // make the token: put id + role inside, stamp it with the secret, expire in 1 day
        const token = jwt.sign(
            { id: user._id, role: user.role }, // what we put inside the token
            process.env.JWT_SECRET,            // the secret key that stamps it
            { expiresIn: "1d" }                // token dies after 1 day
        );

        res.json({ token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ---------------------------------------------------------------
// ME  ->  GET /api/auth/me   (needs token)
// ---------------------------------------------------------------
export const getMe = async (req, res) => {
    try {
        // req.user.id was saved by verifyToken. We hide the secret fields.
        const user = await User.findById(req.user.id).select("-password -resetOtp -resetOtpExpire");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// FORGOT PASSWORD //
//   1. forgotPassword : user gives email  -> we email a 6 digit OTP
//   2. verifyOtp      : user gives email + OTP -> we say if it is correct
//   3. resetPassword  : user gives email + OTP + new password -> we save it


// helper: is this OTP correct and not expired?
const isOtpValid = async (user, otp) => {
    if (!user || !user.resetOtp || !user.resetOtpExpire) return false;
    if (user.resetOtpExpire < Date.now()) return false;      // expired
    return bcrypt.compare(String(otp), user.resetOtp);        // OTP is saved as a hash
};

// STEP 1  ->  POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Only send if the user exists, but always give the same reply
        // (so nobody can use this form to find which emails are registered)
        if (user) {
            const otp = crypto.randomInt(100000, 1000000).toString(); // 6 digits
            user.resetOtp = await bcrypt.hash(otp, 10);
            user.resetOtpExpire = Date.now() + 10 * 60 * 1000;        // valid for 10 minutes
            await user.save();

            await sendEmail(email, "Your E-Cart password reset OTP", `Your OTP is ${otp}. It is valid for 10 minutes.`);
        }

        res.json({ message: "If this email is registered, an OTP has been sent" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// STEP 2  ->  POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!(await isOtpValid(user, otp))) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        res.json({ message: "OTP verified" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// STEP 3  ->  POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });

        // check the OTP again, so nobody can skip step 2
        if (!(await isOtpValid(user, otp))) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.password = await bcrypt.hash(newPassword, 10); // hash the new password
        user.resetOtp = undefined;                          // the OTP can be used only once
        user.resetOtpExpire = undefined;
        await user.save();

        res.json({ message: "Password changed. You can log in now." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
