import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Flower from "../models/Flower.js";
import WrappingOption from "../models/WrappingOption.js";
import Ribbon from "../models/Ribbon.js";
import AddOn from "../models/AddOn.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";
import DeliverySlot from "../models/DeliverySlot.js";
import Banner from "../models/Banner.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { getIO } from "../utils/io.js";

const router = express.Router();
router.use(protect, adminOnly);

router.get("/stats", async (_req, res) => {
  const [orders, users, products, revenueAgg] = await Promise.all([
    Order.countDocuments({ cancelled: false }),
    User.countDocuments({ role: "user" }),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { cancelled: false, paymentStatus: { $in: ["paid", "pending"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);
  const recent = await Order.find().sort("-createdAt").limit(8).populate("user", "name email");
  const lowStock = await Flower.find({ stock: { $lte: 20 } });
  const lowProducts = await Product.find({ stock: { $lte: 5 } });
  const byDay = await Order.aggregate([
    { $match: { cancelled: false } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 14 },
  ]);
  res.json({
    orders,
    users,
    products,
    revenue: revenueAgg[0]?.total || 0,
    recent,
    lowStock,
    lowProducts,
    byDay,
  });
});

router.get("/products", async (_req, res) => res.json(await Product.find().populate("category").sort("-createdAt")));
router.post("/products", async (req, res) => res.status(201).json(await Product.create(req.body)));
router.put("/products/:id", async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/categories", async (_req, res) => res.json(await Category.find()));
router.post("/categories", async (req, res) => res.status(201).json(await Category.create(req.body)));
router.put("/categories/:id", async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/categories/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/flowers", async (_req, res) => res.json(await Flower.find()));
router.post("/flowers", async (req, res) => res.status(201).json(await Flower.create(req.body)));
router.put("/flowers/:id", async (req, res) => res.json(await Flower.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/flowers/:id", async (req, res) => {
  await Flower.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/wrappings", async (_req, res) => res.json(await WrappingOption.find()));
router.post("/wrappings", async (req, res) => res.status(201).json(await WrappingOption.create(req.body)));
router.put("/wrappings/:id", async (req, res) => res.json(await WrappingOption.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/wrappings/:id", async (req, res) => {
  await WrappingOption.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/ribbons", async (_req, res) => res.json(await Ribbon.find()));
router.post("/ribbons", async (req, res) => res.status(201).json(await Ribbon.create(req.body)));
router.put("/ribbons/:id", async (req, res) => res.json(await Ribbon.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/ribbons/:id", async (req, res) => {
  await Ribbon.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/addons", async (_req, res) => res.json(await AddOn.find()));
router.post("/addons", async (req, res) => res.status(201).json(await AddOn.create(req.body)));
router.put("/addons/:id", async (req, res) => res.json(await AddOn.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/addons/:id", async (req, res) => {
  await AddOn.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/orders", async (_req, res) => res.json(await Order.find().populate("user", "name email").sort("-createdAt")));
router.put("/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });
  if (req.body.status && req.body.status !== order.status) {
    order.status = req.body.status;
    order.statusHistory.push({ status: req.body.status });
  }
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  await order.save();
  getIO()?.to(String(order.user)).emit("order:status", { orderId: order.orderId, status: order.status });
  res.json(order);
});

router.get("/customers", async (_req, res) => res.json(await User.find({ role: "user" }).select("-password").sort("-createdAt")));

router.get("/coupons", async (_req, res) => res.json(await Coupon.find().sort("-createdAt")));
router.post("/coupons", async (req, res) => res.status(201).json(await Coupon.create(req.body)));
router.put("/coupons/:id", async (req, res) => res.json(await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/coupons/:id", async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/reviews", async (_req, res) => res.json(await Review.find().populate("user", "name").populate("product", "name").sort("-createdAt")));
router.delete("/reviews/:id", async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/slots", async (_req, res) => res.json(await DeliverySlot.find()));
router.post("/slots", async (req, res) => res.status(201).json(await DeliverySlot.create(req.body)));
router.put("/slots/:id", async (req, res) => res.json(await DeliverySlot.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/slots/:id", async (req, res) => {
  await DeliverySlot.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get("/banners", async (_req, res) => res.json(await Banner.find()));
router.post("/banners", async (req, res) => res.status(201).json(await Banner.create(req.body)));
router.put("/banners/:id", async (req, res) => res.json(await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/banners/:id", async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
