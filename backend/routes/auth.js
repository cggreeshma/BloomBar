import express from "express";
import crypto from "crypto";
import User from "../models/User.js";
import Reward from "../models/Reward.js";
import { generateToken } from "../utils/generateToken.js";
import { sendMail } from "../utils/mailer.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email, phone, password });
    await Reward.create({ user: user._id, points: 50, history: [{ type: "earn", points: 50, note: "Welcome bonus" }] });
    user.rewardPoints = 50;
    await user.save();
    res.status(201).json({
      token: generateToken(user._id, user.role),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, rewardPoints: user.rewardPoints },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    res.json({
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rewardPoints: user.rewardPoints,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });
    const token = crypto.randomBytes(24).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendMail({
      to: user.email,
      subject: "Reset your BloomBar password",
      text: `Reset your password: ${link}`,
      html: `<p>Reset your BloomBar password:</p><p><a href="${link}">${link}</a></p>`,
    });
    res.json({ message: "If that email exists, a reset link has been sent.", devToken: process.env.SMTP_HOST ? undefined : token });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Reset link is invalid or expired." });
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password updated. You can sign in now." });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

router.put("/profile", protect, async (req, res) => {
  const { name, phone, avatar, newsletter } = req.body;
  req.user.name = name ?? req.user.name;
  req.user.phone = phone ?? req.user.phone;
  if (avatar !== undefined) req.user.avatar = avatar;
  if (newsletter !== undefined) req.user.newsletter = newsletter;
  await req.user.save();
  res.json(req.user);
});

router.put("/password", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(req.body.currentPassword || ""))) {
    return res.status(400).json({ message: "Current password is incorrect." });
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: "Password updated." });
});

router.post("/google", async (req, res) => {
  const { email, name, googleId } = req.body;
  if (!email || !googleId) return res.status(400).json({ message: "Google account details missing." });
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({ name: name || "BloomBar Guest", email, googleId, rewardPoints: 50 });
    await Reward.create({ user: user._id, points: 50, history: [{ type: "earn", points: 50, note: "Welcome bonus" }] });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }
  res.json({
    token: generateToken(user._id, user.role),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, rewardPoints: user.rewardPoints },
  });
});

export default router;
