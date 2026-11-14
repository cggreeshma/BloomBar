import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { optionalAuth, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", async (_req, res) => {
  const categories = await Category.find().sort("name");
  res.json(categories);
});

router.get("/", async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    flower,
    color,
    occasion,
    mood,
    sort = "newest",
    featured,
    bestseller,
    newArrival,
    trending,
    seasonal,
    page = 1,
    limit = 24,
  } = req.query;

  const filter = {};
  if (q) {
    filter.$or = [
      { name: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
      { flowerTypes: new RegExp(q, "i") },
      { colors: new RegExp(q, "i") },
      { occasions: new RegExp(q, "i") },
    ];
  }
  if (category) {
    const cat = await Category.findOne({ $or: [{ slug: category }, { name: new RegExp(`^${category}$`, "i") }] });
    if (cat) filter.category = cat._id;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (flower) filter.flowerTypes = new RegExp(flower, "i");
  if (color) filter.colors = new RegExp(color, "i");
  if (occasion) filter.occasions = new RegExp(occasion, "i");
  if (mood) filter.moods = new RegExp(mood, "i");
  if (featured === "true") filter.featured = true;
  if (bestseller === "true") filter.bestseller = true;
  if (newArrival === "true") filter.newArrival = true;
  if (trending === "true") filter.trending = true;
  if (seasonal === "true") filter.seasonal = true;

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popularity: { soldCount: -1 },
    rating: { rating: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).populate("category").sort(sortMap[sort] || sortMap.newest).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

router.get("/home", async (_req, res) => {
  const [featured, bestsellers, newArrivals, trending, seasonal, categories] = await Promise.all([
    Product.find({ featured: true }).limit(8).populate("category"),
    Product.find({ bestseller: true }).limit(8).populate("category"),
    Product.find({ newArrival: true }).limit(8).populate("category"),
    Product.find({ trending: true }).limit(8).populate("category"),
    Product.find({ seasonal: true }).limit(8).populate("category"),
    Category.find(),
  ]);
  res.json({ featured, bestsellers, newArrivals, trending, seasonal, categories });
});

router.get("/:id", optionalAuth, async (req, res) => {
  let product = await Product.findOne({ slug: req.params.id }).populate("category");
  if (!product && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(req.params.id).populate("category");
  }
  if (!product) return res.status(404).json({ message: "Bouquet not found." });
  const related = await Product.find({
    _id: { $ne: product._id },
    $or: [{ category: product.category }, { occasions: { $in: product.occasions } }],
  }).limit(4);
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewed: product._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyViewed: { $each: [product._id], $position: 0, $slice: 12 } },
    });
  }
  res.json({ product, related });
});

router.get("/:id/reviews", async (req, res) => {
  const product = (await Product.findOne({ slug: req.params.id })) || (await Product.findById(req.params.id).catch(() => null));
  if (!product) return res.status(404).json({ message: "Not found" });
  const sort = req.query.sort === "rating" ? { rating: -1 } : { createdAt: -1 };
  const reviews = await Review.find({ product: product._id }).populate("user", "name").sort(sort);
  res.json(reviews);
});

router.post("/:id/reviews", protect, async (req, res) => {
  const product = (await Product.findOne({ slug: req.params.id })) || (await Product.findById(req.params.id).catch(() => null));
  if (!product) return res.status(404).json({ message: "Not found" });
  const purchased = await Order.findOne({
    user: req.user._id,
    "items.product": product._id,
    paymentStatus: { $in: ["paid", "pending"] },
    cancelled: false,
  });
  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating: req.body.rating,
    comment: req.body.comment,
    images: req.body.images || [],
    verified: Boolean(purchased),
  });
  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  product.rating = Number(stats[0].avg.toFixed(1));
  product.reviewCount = stats[0].count;
  await product.save();
  res.status(201).json(review);
});

export default router;
