const express = require("express");
const bcrypt = require("bcrypt");
const connectDatabase = require("./db.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const userModel = require("./models/userModel.js");
const contactModel = require("./models/contactModel.js");
const urlRoutes = require("./routes/urlRoutes.js");
const userRoute = require("./routes/userRoute.js");
const ContactRoute = require("./routes/ContactRoute.js");

dotenv.config();
const app = express();
const PORT = 3000;

// ENV Secrets
const secretKey = process.env.JWT_SECRET || "your_secret_key";
const adminSecretKey = process.env.ADMIN_SECRET;

// Connect to DB
connectDatabase();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://phishing-url-detection-blue.vercel.app",
    credentials: true,
  })
);

// Routes
app.use("/api", urlRoutes);
app.use("/users", userRoute);
app.use("/contacts", ContactRoute);

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userModel.create({ name, email, password: hashedPassword });

  const jwtToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
  res.cookie("authToken", jwtToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });

  if (email === process.env.EMAILADD && password === process.env.PASSWORD) {
    const adminToken = jwt.sign({ email }, adminSecretKey, { expiresIn: "3h" });
    res.cookie("adminToken", adminToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });
  }

  res.json({
    message: "User created and logged in successfully",
    user: { name: newUser.name, email: newUser.email },
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "All fields required" });

  const user = await userModel.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

  const jwtToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
  res.cookie("authToken", jwtToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });

  if (email === process.env.EMAILADD && password === process.env.PASSWORD) {
    const adminToken = jwt.sign({ email }, adminSecretKey, { expiresIn: "3h" });
    res.cookie("adminToken", adminToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });
  }

  res.json({ message: "Login successful" });
});

// Logout
app.post("/logout", (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
    expires: new Date(0),
    path: "/",
  });
  res.cookie("adminToken", "", {
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
    expires: new Date(0),
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// Check Auth
app.get("/auth", (req, res) => {
  const authToken = req.cookies.authToken;
  const adminToken = req.cookies.adminToken;

  if (!authToken) return res.status(401).json({ error: "Unauthorized" });

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
      response.isAdmin = false;
    }

    res.json(response);
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

// Contact Form
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await contactModel.create({ name, email, message });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Contact Form Submission",
      text: `You received a new message from:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending message" });
  }
});

// OTP Store
let otpStore = {};

const otpTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `Support <${process.env.EMAIL}>`,
    to: email,
    subject: "Your Secure One-Time Password (OTP)",
    html: `<div style="font-family:Arial,sans-serif;padding:20px;">
            <h2 style="color:#333;">Dear ${name}</h2>
            <p>Your One-Time Password (OTP) is: <strong style="font-size:18px;">${otp}</strong></p>
            <p>This code is valid for 5 minutes.</p>
            <p>If you didn't request this, ignore the email.</p>
            <br>
            <p>Regards,<br><b>DarkShield Security Team</b></p>
          </div>`,
  };
  await otpTransporter.sendMail(mailOptions);
};

// Send OTP
app.post("/send-otp", async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!name) return res.status(400).json({ error: "Name is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expiresAt: Date.now() + 300000 }; // 5 min expiry

  try {
    await sendOtpEmail(email, name, otp);
    res.json({ message: "OTP sent successfully! Check inbox/spam." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];
  if (!record) return res.status(400).json({ error: "OTP expired or not requested" });

  if (record.otp.toString() !== otp.toString()) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  if (record.expiresAt < Date.now()) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }

  delete otpStore[email];
  res.json({ message: "OTP verified successfully!" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
