import express from "express";
import Address from "../models/Address.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import Reward from "../models/Reward.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";
import ScheduledDelivery from "../models/ScheduledDelivery.js";
import User from "../models/User.js";
import Newsletter from "../models/Newsletter.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/addresses", protect, async (req, res) => {
  res.json(await Address.find({ user: req.user._id }).sort("-isDefault -createdAt"));
});

router.post("/addresses", protect, async (req, res) => {
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.create({ ...req.body, user: req.user._id });
  res.status(201).json(address);
});

router.put("/addresses/:id", protect, async (req, res) => {
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  if (!address) return res.status(404).json({ message: "Address not found." });
  res.json(address);
});

router.delete("/addresses/:id", protect, async (req, res) => {
  await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

router.get("/wishlist", protect, async (req, res) => {
  let wl = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wl) wl = await Wishlist.create({ user: req.user._id, products: [] });
  res.json(wl);
});

router.post("/wishlist/:productId", protect, async (req, res) => {
  let wl = await Wishlist.findOne({ user: req.user._id });
  if (!wl) wl = await Wishlist.create({ user: req.user._id, products: [] });
  const id = req.params.productId;
  if (wl.products.some((p) => String(p) === id)) wl.products = wl.products.filter((p) => String(p) !== id);
  else wl.products.push(id);
  await wl.save();
  res.json(await wl.populate("products"));
});

router.get("/rewards", protect, async (req, res) => {
  let reward = await Reward.findOne({ user: req.user._id });
  if (!reward) reward = await Reward.create({ user: req.user._id, points: req.user.rewardPoints || 0, history: [] });
  const coupons = await Coupon.find({ active: true });
  res.json({ points: req.user.rewardPoints, reward, coupons });
});

router.get("/reviews", protect, async (req, res) => {
  res.json(await Review.find({ user: req.user._id }).populate("product", "name images"));
});

router.get("/recent", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("recentlyViewed");
  res.json(user.recentlyViewed || []);
});

router.get("/schedule", protect, async (req, res) => {
  res.json(await ScheduledDelivery.find({ user: req.user._id }).populate("product").sort("date"));
});

router.post("/schedule", protect, async (req, res) => {
  const item = await ScheduledDelivery.create({ ...req.body, user: req.user._id });
  res.status(201).json(item);
});

router.delete("/schedule/:id", protect, async (req, res) => {
  await ScheduledDelivery.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

router.post("/newsletter", optionalAuth, async (req, res) => {
  if (!req.body.email) return res.status(400).json({ message: "Email is required." });
  await Newsletter.findOneAndUpdate({ email: req.body.email.toLowerCase() }, { email: req.body.email.toLowerCase() }, { upsert: true });
  res.json({ message: "Welcome to the BloomBar journal." });
});

export default router;
