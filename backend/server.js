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

dotenv.config();
const app = express();
const secretKey = process.env.JWT_SECRET || "your_secret_key";
const adminSecretKey = process.env.ADMIN_SECRET;

connectDatabase();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // ✅ Enable cookie parsing
app.use(cors({ origin: "https://phishing-detection.netlify.app", credentials: true })); // ✅ Allow credentials

// ✅ Signup Route (Secure Cookie) - Updated version
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
  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });

  // Automatically log in the user after signup
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

  // Return success message AND user data
  res.json({
    message: "User created and logged in successfully",
    user: { name: newUser.name, email: newUser.email },
  });
});

// ✅ Login Route (Secure Cookie)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All fields required" });

  const user = await userModel.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(401).json({ error: "Invalid credentials" });

  const jwtToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
  res.cookie("authToken", jwtToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production", // 🔥 Secure only in production
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000,
    path: "/", // ✅ Ensure the path is set to "/"
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

// ✅ Logout Route (Clears Cookie)
app.post("/logout", (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: false,
    secure: false, // ❗ Change to `true` in production with HTTPS
    sameSite: "Lax",
    expires: new Date(0), // ✅ Forces immediate expiration
    path: "/", // ✅ Ensure the path matches the one used when setting the cookie
  });
  res.cookie("adminToken", "", {
    httpOnly: false,
    secure: false, // ❗ Change to `true` in production with HTTPS
    sameSite: "Lax",
    expires: new Date(0), // ✅ Forces immediate expiration
    path: "/", // ✅ Ensure the path matches the one used when setting the cookie
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// ✅ Check Authentication API
app.get("/auth", (req, res) => {
  const authToken = req.cookies.authToken;
  const adminToken = req.cookies.adminToken;

  if (!authToken) {
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
      response.isAdmin = false;
    }

    res.json(response);
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

app.use("/api", urlRoutes);
app.use("/users", userRoute);
app.use("/contacts",ContactRoute)

// Contact Us Route
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await contactModel.create({ name, email, message });
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.EMAIL_PASS, // App password (not normal password)
      },
    });
    let mailOptions = {
      from: process.env.EMAIL, // ✅ Must be your authenticated email
      to: process.env.EMAIL, // ✅ Sends to your email
      subject: "New Contact Form Submission",
      text: `You received a new message from:

    Name: ${name}
    Email: ${email}
    Message: ${message}`,
      replyTo: email, // ✅ When you hit "Reply," it replies to the user
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending message" });
  }
});

//send and verify otp
let otpStore = {};
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email,name, otp) => {
  const mailOptions = {
    from: `Support <${process.env.EMAIL}>`,
    to: email,
    subject: "Your Secure One-Time Password (OTP)",
    html: `<div style="font-family:Arial,sans-serif;padding:20px;">
            <h2 style="color:#333;">Dear ${name}</h2>
            <p>Your One-Time Password (OTP) for secure access is: <strong style="font-size:18px;">${otp}</strong></p>
            <p>This code is valid for the next 5 minutes.Please enter it on the verification page to proceed.</p>
            <p>if you didn't request this OTP,please ignore this email.</p>
            <br>
            <p>Regards,<br><b>DarkShield Security Team</b></p>
          </div>`,
  };
  await transporter.sendMail(mailOptions);
};

// Send OTP API
app.post("/send-otp", async (req, res) => {
  const { email,name } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!name) return res.status(400).json({ error: "Name is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expiresAt: Date.now() + 300000 };

  try {
    await sendOtpEmail(email,name, otp);
    res.json({
      message: "OTP sent successfully! Check your inbox/spam folder.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) {
    return res.status(400).json({ error: "OTP expired or not requested" });
  }

  // Ensure OTP is compared as a string
  if (otpStore[email].otp.toString() !== otp.toString()) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  if (otpStore[email].expiresAt < Date.now()) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }

  delete otpStore[email];
  res.json({ message: "OTP verified successfully!" });
});




//testing
app.get('/check-cookie', (req, res) => {
  const cookie = req.cookies.authToken;
  if (cookie) {
    res.json({ authToken: cookie });
  } else {
    res.status(401).json({ message: 'No cookie found' });
  }
});


//end

app.listen(3000, () => console.log("Server running on port 3000"));