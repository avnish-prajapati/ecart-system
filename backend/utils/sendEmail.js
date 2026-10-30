// ← sends an email with nodemailer (used for the forgot-password OTP)

import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
    // If email is not set up in .env, just print the message in the terminal.
    // This keeps the project working during development and demo.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[DEV MODE] Email to ${to} -> ${text}`);
        return;
    }

    // The "transporter" is the mail truck. Gmail needs an App Password.
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
        from: `"E-Cart" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
    });
};

export default sendEmail;
