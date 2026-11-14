import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import CustomBouquet from "../models/CustomBouquet.js";
import Coupon from "../models/Coupon.js";
import { protect } from "../middleware/auth.js";
import { applyCoupon, DELIVERY_FEE } from "../utils/pricing.js";

const router = express.Router();
router.use(protect);

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate("items.product")
    .populate("items.customBouquet");
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const totals = (cart, deliveryType = "standard") => {
  const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const deliveryCharge = cart.items.length ? DELIVERY_FEE[deliveryType] || 79 : 0;
  const total = Math.max(0, subtotal - (cart.discount || 0) + deliveryCharge);
  return { subtotal, discount: cart.discount || 0, deliveryCharge, total };
};

router.get("/", async (req, res) => {
  const cart = await getCart(req.user._id);
  res.json({ cart, ...totals(cart) });
});

router.post("/add", async (req, res) => {
  const cart = await getCart(req.user._id);
  const { kind, productId, customBouquetId, quantity = 1 } = req.body;
  if (kind === "product") {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.stock < 1) return res.status(400).json({ message: "This bouquet is currently out of stock." });
    const existing = cart.items.find((i) => i.kind === "product" && String(i.product) === String(product._id));
    if (existing) existing.quantity += quantity;
    else {
      cart.items.push({
        kind: "product",
        product: product._id,
        name: product.name,
        image: product.images[0],
        quantity,
        unitPrice: product.price,
      });
    }
  } else {
    const custom = await CustomBouquet.findById(customBouquetId);
    if (!custom) return res.status(404).json({ message: "Custom bouquet not found." });
    cart.items.push({
      kind: "custom",
      customBouquet: custom._id,
      name: custom.name || "Custom Bouquet",
      image: custom.flowers?.[0]?.image,
      quantity,
      unitPrice: custom.totalPrice,
      customSummary: `${custom.size} · ${custom.colorTheme} · ${custom.wrapping?.name || ""}`,
    });
  }
  await cart.save();
  const populated = await getCart(req.user._id);
  res.json({ cart: populated, ...totals(populated) });
});

router.put("/item/:itemId", async (req, res) => {
  const cart = await getCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: "Item not found." });
  item.quantity = Math.max(1, Number(req.body.quantity || 1));
  await cart.save();
  const populated = await getCart(req.user._id);
  res.json({ cart: populated, ...totals(populated) });
});

router.delete("/item/:itemId", async (req, res) => {
  const cart = await getCart(req.user._id);
  cart.items = cart.items.filter((i) => String(i._id) !== req.params.itemId);
  await cart.save();
  const populated = await getCart(req.user._id);
  res.json({ cart: populated, ...totals(populated) });
});

router.post("/coupon", async (req, res) => {
  const cart = await getCart(req.user._id);
  const coupon = await Coupon.findOne({ code: req.body.code?.toUpperCase() });
  const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discount = applyCoupon(coupon, subtotal);
  if (!coupon || !discount) return res.status(400).json({ message: "Coupon is invalid or does not meet the minimum order." });
  cart.couponCode = coupon.code;
  cart.discount = discount;
  await cart.save();
  const populated = await getCart(req.user._id);
  res.json({ cart: populated, ...totals(populated) });
});

router.delete("/coupon", async (req, res) => {
  const cart = await getCart(req.user._id);
  cart.couponCode = "";
  cart.discount = 0;
  await cart.save();
  res.json({ cart, ...totals(cart) });
});

export default router;
