import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function normalizeUsername(username) {
  return username.trim().toLowerCase().replace(/\s+/g, "_");
}

export async function registerUser(req, res) {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    username = normalizeUsername(username);

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed });
    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    if (error.message === "Username cannot contain spaces.") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(400).json({ message: "Registration failed", error: error.message });
  }
}

export async function loginUser(req, res) {
  let { username, password } = req.body;

  try {
    username = normalizeUsername(username);

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
}