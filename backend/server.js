const express = require("express");
const bcrypt = require("bcrypt");
const connectDatabase = require("./db.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const userModel = require("./models/userModel.js");
const contactModel = require("./models/contactModel.js");
const urlRoutes = require("./routes/urlRoutes.js");
const userRoute = require("./routes/userRoute.js");
const ContactRoute = require("./routes/ContactRoute.js");
const nodemailer = require("nodemailer");
const urlDBRoutes=require('./routes/urlDBRoutes.js');

dotenv.config();
const app = express();
const secretKey = process.env.JWT_SECRET;
const adminSecretKey = process.env.ADMIN_SECRET;

connectDatabase();
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "https://phishing-detection.netlify.app",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    console.log("Signup attempt:", { email }); // Debug
    if (!name || !email || !password)
        return res.status(400).json({ error: "All fields are required" });

    const existingUser = await userModel.findOne({ email });
    if (existingUser)
        return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
    });

    const jwtToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
    res.setHeader("Set-Cookie", [
        `authToken=${jwtToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${24 * 60 * 60}; Partitioned`,
    ]);

    const isAdmin = email === process.env.EMAILADD;
    console.log("Signup: isAdmin check:", { email, isAdmin, EMAILADD: process.env.EMAILADD }); // Debug
    if (isAdmin) {
        const adminToken = jwt.sign({ email }, adminSecretKey, { expiresIn: "3h" });
        res.setHeader("Set-Cookie", [
            `authToken=${jwtToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${24 * 60 * 60}; Partitioned`,
            `adminToken=${adminToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${24 * 60 * 60}; Partitioned`,
        ]);
    }

    res.json({
        message: "User created and logged in successfully",
        user: { name: newUser.name, email: newUser.email },
        token: jwtToken,
        isAdmin,
    });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", { email }); // Debug
    if (!email || !password) return res.status(400).json({ error: "All fields required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const jwtToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
    const isAdmin = email === process.env.EMAILADD;
    console.log("Login: isAdmin check:", { email, isAdmin, EMAILADD: process.env.EMAILADD }); // Debug
    if (isAdmin) {
        const adminToken = jwt.sign({ email }, adminSecretKey, { expiresIn: "3h" });
        res.setHeader("Set-Cookie", [
            `authToken=${jwtToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${24 * 60 * 60}; Partitioned`,
            `adminToken=${adminToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${24 * 60 * 60}; Partitioned`,
        ]);
    } else {
        res.setHeader("Set-Cookie", [
            `authToken=${jwtToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${24 * 60 * 60}; Partitioned`,
        ]);
    }

    res.json({ message: "Login successful", token: jwtToken, isAdmin });
});

app.post("/logout", (req, res) => {
    console.log("Logout request received"); // Debug
    res.setHeader("Set-Cookie", [
        `authToken=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0; Partitioned`,
        `adminToken=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0; Partitioned`,
    ]);
    res.status(200).json({ message: "Logged out successfully" });
});

app.get("/auth", (req, res) => {
    console.log("Auth request headers:", req.headers); // Debug
    console.log("Cookies:", req.cookies); // Debug
    const authToken = req.cookies.authToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split("Bearer ")[1] : null);
    const adminToken = req.cookies.adminToken;
    console.log("authToken:", authToken); // Debug
    console.log("adminToken:", adminToken); // Debug
    if (!authToken) {
        console.log("No authToken found in cookies or Authorization header"); // Debug
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decodedUser = jwt.verify(authToken, secretKey);
        const response = { authenticated: true, user: decodedUser };

        if (adminToken) {
            try {
                jwt.verify(adminToken, adminSecretKey);
                response.isAdmin = true;
            } catch {
                response.isAdmin = false;
            }
        } else {
            response.isAdmin = decodedUser.email === process.env.EMAILADD;
        }
        console.log("Auth response:", response); // Debug
        res.json(response);
    } catch (error) {
        console.error("Token verification error:", error.message); // Debug
        res.status(403).json({ error: "Invalid or expired token" });
    }
});

// Routes
app.use("/api", urlRoutes);
app.use("/users", userRoute);
app.use("/contacts", ContactRoute);
app.use('/urls',urlDBRoutes);

// Contact form and email functionality
app.post("/send", async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await contactModel.create({ name, email, message });

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: process.env.EMAIL,
            subject: "New Contact Form Submission",
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            replyTo: email,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Message sent successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Error sending message" });
    }
});

// OTP functionality
let otpStore = {};
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
});

const sendOtpEmail = async (email, name, otp) => {
    const mailOptions = {
        from: `Support <${process.env.EMAIL}>`,
        to: email,
        subject: "Your Secure One-Time Password (OTP)",
        html: `<div><h2>Dear ${name}</h2><p>Your OTP: <strong>${otp}</strong></p><p>Valid for 5 minutes.</p></div>`,
    };
    await transporter.sendMail(mailOptions);
};

app.post("/send-otp", async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: "Missing fields" });
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, expiresAt: Date.now() + 300000 };
    try {
        await sendOtpEmail(email, name, otp);
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!otpStore[email]) return res.status(400).json({ error: "OTP expired or not requested" });
    if (otpStore[email].otp.toString() !== otp.toString())
        return res.status(400).json({ error: "Invalid OTP" });
    if (otpStore[email].expiresAt < Date.now()) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP expired" });
    }
    delete otpStore[email];
    res.json({ message: "OTP verified successfully!" });
});

// Server setup
app.listen(3000, () => console.log("Server running on port 3000"));