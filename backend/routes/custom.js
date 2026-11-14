import express from "express";
import Flower from "../models/Flower.js";
import WrappingOption from "../models/WrappingOption.js";
import Ribbon from "../models/Ribbon.js";
import AddOn from "../models/AddOn.js";
import CustomBouquet from "../models/CustomBouquet.js";
import Product from "../models/Product.js";
import { optionalAuth, protect } from "../middleware/auth.js";
import { computeCustomTotal, SIZE_MULTIPLIER } from "../utils/pricing.js";

const router = express.Router();

router.get("/studio", async (_req, res) => {
  const [flowers, wrappings, ribbons, addOns] = await Promise.all([
    Flower.find(),
    WrappingOption.find(),
    Ribbon.find(),
    AddOn.find(),
  ]);
  res.json({ flowers, wrappings, ribbons, addOns, sizes: SIZE_MULTIPLIER });
});

const hydrateTotal = async (payload) => {
  const wrapping = payload.wrapping?.option ? await WrappingOption.findById(payload.wrapping.option) : null;
  const ribbon = payload.ribbon?.option ? await Ribbon.findById(payload.ribbon.option) : null;
  return computeCustomTotal({
    flowers: payload.flowers,
    size: payload.size,
    wrappingPrice: wrapping?.price || 0,
    ribbonPrice: ribbon?.price || 0,
    addOns: payload.addOns,
  });
};

router.post("/preview-price", async (req, res) => {
  const total = await hydrateTotal(req.body);
  res.json({ total });
});

router.post("/", optionalAuth, async (req, res) => {
  const total = await hydrateTotal(req.body);
  const bouquet = await CustomBouquet.create({
    ...req.body,
    user: req.user?._id,
    totalPrice: total,
    saved: Boolean(req.body.saved),
  });
  res.status(201).json(bouquet);
});

router.get("/saved", protect, async (req, res) => {
  const items = await CustomBouquet.find({ user: req.user._id, saved: true }).sort("-createdAt");
  res.json(items);
});

router.get("/share/:shareId", async (req, res) => {
  const item = await CustomBouquet.findOne({ shareId: req.params.shareId }).populate("flowers.flower");
  if (!item) return res.status(404).json({ message: "Design not found." });
  res.json(item);
});

router.post("/surprise", async (req, res) => {
  const budget = Number(req.body.budget || 1500);
  const color = (req.body.color || "").toLowerCase();
  let flowers = await Flower.find(color ? { colors: new RegExp(color, "i") } : {});
  if (!flowers.length) flowers = await Flower.find();
  const picked = [];
  let spent = 180;
  const wrapping = await WrappingOption.findOne();
  const ribbon = await Ribbon.findOne();
  spent += (wrapping?.price || 0) + (ribbon?.price || 0);
  for (const f of flowers.slice(0, 4)) {
    const qty = Math.max(3, Math.min(12, Math.floor((budget - spent) / (f.price * 4)) || 3));
    const cost = qty * f.price;
    if (spent + cost > budget) continue;
    picked.push({ flower: f._id, name: f.name, image: f.image, quantity: qty, unitPrice: f.price, color: f.colors[0] });
    spent += cost;
  }
  const size = budget > 3000 ? "premium" : budget > 2000 ? "large" : budget > 1200 ? "medium" : "small";
  const total = computeCustomTotal({
    flowers: picked,
    size,
    wrappingPrice: wrapping?.price || 0,
    ribbonPrice: ribbon?.price || 0,
    addOns: [],
  });
  res.json({
    flowers: picked,
    size,
    colorTheme: color || "pastel mix",
    wrapping: wrapping ? { option: wrapping._id, name: wrapping.name, color: wrapping.color } : {},
    ribbon: ribbon ? { option: ribbon._id, name: ribbon.name, color: ribbon.colors?.[0] } : {},
    totalPrice: total,
    withinBudget: total <= budget,
  });
});

router.post("/budget-builder", async (req, res) => {
  const budget = Number(req.body.budget || 2000);
  const flowers = await Flower.find().sort("price");
  const wrapping = await WrappingOption.findOne({ price: { $lte: 80 } }) || (await WrappingOption.findOne());
  const ribbon = await Ribbon.findOne();
  const addOns = await AddOn.find({ price: { $lte: budget * 0.2 } }).limit(1);
  const picked = [];
  let remaining = budget - (wrapping?.price || 0) - (ribbon?.price || 0);
  for (const f of flowers) {
    const qty = Math.floor(remaining / (f.price * 2));
    if (qty < 3) continue;
    const use = Math.min(qty, 10);
    picked.push({ flower: f._id, name: f.name, image: f.image, quantity: use, unitPrice: f.price, color: f.colors[0] });
    remaining -= use * f.price;
    if (picked.length >= 3) break;
  }
  const extra = remaining > (addOns[0]?.price || 9999) ? addOns.map((a) => ({ addOn: a._id, name: a.name, price: a.price, image: a.image })) : [];
  const total = computeCustomTotal({
    flowers: picked,
    size: "medium",
    wrappingPrice: wrapping?.price || 0,
    ribbonPrice: ribbon?.price || 0,
    addOns: extra,
  });
  res.json({ flowers: picked, wrapping, ribbon, addOns: extra, totalPrice: total, remaining: budget - total });
});

router.get("/mood/:mood", async (req, res) => {
  const products = await Product.find({ moods: new RegExp(req.params.mood, "i") }).limit(8);
  res.json(products);
});

export default router;
