const express = require("express");
const bcrypt = require("bcrypt");
const connectDatabase = require("./db.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const userModel = require("./models/userModel.js");
const contactModel = require("./models/contactModel.js");
const urlRoutes = require("./routes/urlRoutes.js");
const userRoute = require("./routes/userRoute.js");
const ContactRoute = require("./routes/ContactRoute.js");
const nodemailer = require("nodemailer");

// Load environment variables
dotenv.config();
const app = express();

// Security and configuration constants
const isProduction = process.env.NODE_ENV === 'production';
const secretKey = process.env.JWT_SECRET || "your_secret_key";
const adminSecretKey = process.env.ADMIN_SECRET;
const PORT = process.env.PORT || 3000;
const DOMAIN = isProduction ? "phishing-suw5.onrender.com" : undefined;

// Database connection
connectDatabase();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});
app.use(limiter);

// Body parsing middleware
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://phishing-url-detection-blue.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ['set-cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Cookie configuration
const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'None' : 'Lax',
  maxAge: 60 * 60 * 1000, // 1 hour
  path: '/',
  ...(DOMAIN && { domain: DOMAIN })
});

// Enhanced Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate tokens
    const jwtToken = jwt.sign(
      { email, userId: newUser._id }, 
      secretKey, 
      { expiresIn: "1h" }
    );

    // Set cookies
    res.cookie("authToken", jwtToken, getCookieOptions());

    // Admin check
    if (email === process.env.EMAILADD && password === process.env.PASSWORD) {
      const adminToken = jwt.sign(
        { email, isAdmin: true, userId: newUser._id }, 
        adminSecretKey, 
        { expiresIn: "3h" }
      );
      res.cookie("adminToken", adminToken, getCookieOptions());
    }

    // Remove sensitive data before sending response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: "User created and logged in successfully",
      data: {
        user: newUser,
        token: jwtToken
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      status: 'error',
      error: "Internal server error" 
    });
  }
});

// Enhanced Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'fail',
        error: "All fields required" 
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ 
        status: 'fail',
        error: "User not found" 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: 'fail',
        error: "Invalid credentials" 
      });
    }

    // Generate tokens
    const jwtToken = jwt.sign(
      { email, userId: user._id }, 
      secretKey, 
      { expiresIn: "1h" }
    );

    // Set cookies
    res.cookie("authToken", jwtToken, getCookieOptions());

    // Admin check
    if (email === process.env.EMAILADD && password === process.env.PASSWORD) {
      const adminToken = jwt.sign(
        { email, isAdmin: true, userId: user._id }, 
        adminSecretKey, 
        { expiresIn: "3h" }
      );
      res.cookie("adminToken", adminToken, getCookieOptions());
    }

    // Remove sensitive data before sending response
    user.password = undefined;

    res.status(200).json({ 
      status: 'success',
      message: "Login successful",
      data: {
        user,
        token: jwtToken
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      status: 'error',
      error: "Internal server error" 
    });
  }
});

// Enhanced Logout Route
app.post("/logout", (req, res) => {
  const cookieOptions = {
    ...getCookieOptions(),
    expires: new Date(0) // Immediately expire the cookie
  };

  res.cookie("authToken", "", cookieOptions);
  res.cookie("adminToken", "", cookieOptions);

  res.status(200).json({ 
    status: 'success',
    message: "Logged out successfully" 
  });
});

// Enhanced Auth Check Route
app.get("/auth", (req, res) => {
  try {
    const authToken = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
    const adminToken = req.cookies.adminToken;

    if (!authToken) {
      return res.status(401).json({ 
        status: 'fail',
        error: "Unauthorized" 
      });
    }

    // Verify auth token
    const decodedUser = jwt.verify(authToken, secretKey);
    const response = { 
      status: 'success',
      authenticated: true, 
      data: {
        user: decodedUser,
        isAdmin: false
      }
    };

    // Verify admin token if present
    if (adminToken) {
      try {
        const decodedAdmin = jwt.verify(adminToken, adminSecretKey);
        response.data.isAdmin = decodedAdmin.isAdmin || false;
      } catch (adminError) {
        console.error("Admin token verification failed:", adminError);
        response.data.isAdmin = false;
      }
    }

    res.json(response);
  } catch (error) {
    console.error("Auth token verification failed:", error);
    res.status(403).json({ 
      status: 'fail',
      error: "Invalid or expired token" 
    });
  }
});

// Other routes
app.use("/api", urlRoutes);
app.use("/users", userRoute);
app.use("/contacts", ContactRoute);

// Contact Us Route
app.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        status: 'fail',
        error: "All fields are required" 
      });
    }

    // Save to database
    await contactModel.create({ name, email, message });

    // Send email
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

    res.status(200).json({ 
      status: 'success',
      message: "Message sent successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: 'error',
      error: "Error sending message" 
    });
  }
});

// OTP Functions
const otpStore = new Map();
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
            <p>Your One-Time Password (OTP) for secure access is: <strong style="font-size:18px;">${otp}</strong></p>
            <p>This code is valid for the next 5 minutes. Please enter it on the verification page to proceed.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <br>
            <p>Regards,<br><b>DarkShield Security Team</b></p>
          </div>`,
  };
  await otpTransporter.sendMail(mailOptions);
};

app.post("/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Validate input
    if (!email || !name) {
      return res.status(400).json({ 
        status: 'fail',
        error: "Email and name are required" 
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, { 
      otp, 
      expiresAt: Date.now() + 300000 // 5 minutes
    });

    // Send OTP email
    await sendOtpEmail(email, name, otp);

    res.status(200).json({ 
      status: 'success',
      message: "OTP sent successfully! Check your inbox/spam folder." 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: 'error',
      error: "Failed to send OTP" 
    });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ 
        status: 'fail',
        error: "Email and OTP are required" 
      });
    }

    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    if (!otpData) {
      return res.status(400).json({ 
        status: 'fail',
        error: "OTP expired or not requested" 
      });
    }

    if (otpData.otp.toString() !== otp.toString()) {
      return res.status(400).json({ 
        status: 'fail',
        error: "Invalid OTP" 
      });
    }

    if (otpData.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ 
        status: 'fail',
        error: "OTP expired" 
      });
    }

    // OTP verified successfully
    otpStore.delete(email);
    res.status(200).json({ 
      status: 'success',
      message: "OTP verified successfully!" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: 'error',
      error: "Error verifying OTP" 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    error: 'Something broke!' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
});