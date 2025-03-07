const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const connectDatabase = require("./db.js");
const userModel = require("./models/userModel.js");
const jwt = require("jsonwebtoken");
const secretKey =
  "f9a8c24e2c3f4370ad9b1e4d8b6874a5123e9c678fbf5a99b8d3cbae3b567d90";
const cors = require("cors");

connectDatabase();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

//signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(404).json({ error: "body property is missing" });
  }
  const hashed_password = await bcrypt.hash(password, 10);
  const user = await userModel.findOne({ email: email });
  if (user) {
    return res.status(409).json({ error: "user already exists" });
  }
  await userModel.create({
    name: name,
    email: email,
    password: hashed_password,
  });

  const jwtToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
  res.cookie("authToken", jwtToken, {
    maxAge: 60 * 60 * 1000,
    sameSite: "Strict",
  });
  res.json({ message: "User created successfully. You can now log in." });
});

//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "body property is missing" });
  }
  const user = await userModel.findOne({ email: email });
  if (!user) {
    console.log("hello");
    return res.status(404).json({ error: "user is not exists please signup" });
  }

  const isMatchedPwd = await bcrypt.compare(password, user.password);

  if (!isMatchedPwd) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const jwtToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
  res.cookie("authToken", jwtToken, {
    maxAge: 60 * 60 * 1000,
    sameSite: "Strict",
  });

  res.json({ message: "user loggedIn successfully" });
});

app.listen(3000, () => {
  console.log("server is running at port 3000");
});
