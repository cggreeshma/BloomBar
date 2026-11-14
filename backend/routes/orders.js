import express from "express";
import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import Coupon from "../models/Coupon.js";
import Reward from "../models/Reward.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import DeliverySlot from "../models/DeliverySlot.js";
import { protect } from "../middleware/auth.js";
import { applyCoupon, DELIVERY_FEE, makeOrderId } from "../utils/pricing.js";
import { sendMail } from "../utils/mailer.js";
import { getIO } from "../utils/io.js";

const router = express.Router();
router.use(protect);

const careFromItems = (items) => {
  const types = items.flatMap((i) => i.flowerTypes || []);
  const unique = [...new Set(types)];
  if (!unique.length) {
    return "Trim stems at an angle, change water daily, and keep your bouquet away from direct sun and fruit bowls.";
  }
  return `Care for ${unique.join(", ")}: recut stems, use fresh water, mist petals lightly, and display in a cool room.`;
};

router.get("/slots", async (_req, res) => {
  const slots = await DeliverySlot.find({ active: true });
  res.json(slots);
});

router.post("/checkout", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart?.items?.length) return res.status(400).json({ message: "Your cart is empty." });

    const {
      addressId,
      address,
      recipient,
      giftMessage,
      deliveryDate,
      timeSlot,
      deliveryType = "standard",
      paymentMethod,
      useRewards = 0,
      couponCode,
    } = req.body;

    let shipping = address;
    if (addressId) {
      const saved = await Address.findOne({ _id: addressId, user: req.user._id });
      if (!saved) return res.status(400).json({ message: "Address not found." });
      shipping = saved.toObject();
    }
    if (!shipping?.line1 || !shipping?.city || !shipping?.pincode || !shipping?.name || !shipping?.phone) {
      return res.status(400).json({ message: "A complete delivery address is required." });
    }
    if (!deliveryDate || !timeSlot) {
      return res.status(400).json({ message: "Please choose a delivery date and time slot." });
    }
    if (!paymentMethod) return res.status(400).json({ message: "Select a payment method." });

    const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    let discount = cart.discount || 0;
    const code = couponCode || cart.couponCode;
    if (code) {
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });
      discount = applyCoupon(coupon, subtotal);
    }
    const deliveryCharge = DELIVERY_FEE[deliveryType] || 79;
    const rewardsCap = Math.min(Number(useRewards) || 0, req.user.rewardPoints || 0, Math.floor(subtotal * 0.2));
    const total = Math.max(0, subtotal - discount - rewardsCap + deliveryCharge);

    const items = [];
    for (const i of cart.items) {
      if (i.kind === "product" && i.product) {
        const p = await Product.findById(i.product);
        if (!p || p.stock < i.quantity) {
          return res.status(400).json({ message: `${i.name || "A bouquet"} does not have enough stock.` });
        }
        items.push({
          kind: "product",
          product: p._id,
          name: p.name,
          image: p.images[0],
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          flowerTypes: p.flowerTypes,
        });
      } else {
        items.push({
          kind: "custom",
          customBouquet: i.customBouquet,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          customSummary: i.customSummary,
          flowerTypes: [],
        });
      }
    }

    const order = await Order.create({
      orderId: makeOrderId(),
      user: req.user._id,
      items,
      address: shipping,
      recipient: recipient || { name: shipping.name, phone: shipping.phone },
      giftMessage,
      deliveryDate,
      timeSlot,
      deliveryType,
      subtotal,
      deliveryCharge,
      discount,
      rewardsUsed: rewardsCap,
      total,
      couponCode: code,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: "Order Placed",
      statusHistory: [{ status: "Order Placed" }],
      careGuide: careFromItems(items),
    });

    await Payment.create({
      order: order._id,
      user: req.user._id,
      method: paymentMethod,
      amount: total,
      status: "pending",
    });

    if (paymentMethod === "cod") {
      await finalizeOrder(order, req.user, cart, rewardsCap, false);
      await sendMail({
        to: req.user.email,
        subject: `BloomBar order ${order.orderId} confirmed`,
        text: `Thank you. Your order ${order.orderId} is placed. Pay ₹${total} on delivery.`,
      });
      return res.status(201).json({ order, payNow: false });
    }

    if (paymentMethod === "razorpay" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const Razorpay = (await import("razorpay")).default;
      const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const rzpOrder = await rzp.orders.create({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: order.orderId,
      });
      order.razorpayOrderId = rzpOrder.id;
      await order.save();
      return res.status(201).json({
        order,
        payNow: true,
        razorpay: { orderId: rzpOrder.id, key: process.env.RAZORPAY_KEY_ID, amount: rzpOrder.amount },
      });
    }

    return res.status(201).json({ order, payNow: true, demoCheckout: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

const finalizeOrder = async (order, user, cart, rewardsCap, paid) => {
  for (const i of order.items) {
    if (i.kind === "product" && i.product) {
      await Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity, soldCount: i.quantity } });
    }
  }
  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }
  const earned = Math.floor(order.total / 50);
  const userDoc = await User.findById(user._id);
  userDoc.rewardPoints = Math.max(0, (userDoc.rewardPoints || 0) - rewardsCap + earned);
  await userDoc.save();
  let reward = await Reward.findOne({ user: user._id });
  if (!reward) reward = await Reward.create({ user: user._id, points: userDoc.rewardPoints, history: [] });
  if (rewardsCap) reward.history.push({ type: "redeem", points: rewardsCap, note: `Order ${order.orderId}` });
  if (earned) reward.history.push({ type: "earn", points: earned, note: `Order ${order.orderId}` });
  reward.points = userDoc.rewardPoints;
  await reward.save();
  if (paid) {
    order.paymentStatus = "paid";
    order.status = "Order Confirmed";
    order.statusHistory.push({ status: "Order Confirmed" });
    await order.save();
    await Payment.findOneAndUpdate({ order: order._id }, { status: "paid" });
  } else {
    order.status = "Order Confirmed";
    order.statusHistory.push({ status: "Order Confirmed" });
    await order.save();
  }
  cart.items = [];
  cart.discount = 0;
  cart.couponCode = "";
  await cart.save();
};

router.post("/pay/:orderId", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.cancelled) return res.status(400).json({ message: "Order was cancelled." });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, demo } = req.body;
  if (razorpay_order_id && razorpay_payment_id && razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
    if (expected !== razorpay_signature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ message: "Payment verification failed." });
    }
    order.razorpayPaymentId = razorpay_payment_id;
  } else if (!demo && process.env.RAZORPAY_KEY_SECRET) {
    return res.status(400).json({ message: "Payment details missing." });
  }

  const cart = (await Cart.findOne({ user: req.user._id })) || { items: [], save: async () => {} };
  await finalizeOrder(order, req.user, cart.items ? cart : await Cart.create({ user: req.user._id, items: [] }), order.rewardsUsed, true);
  await sendMail({
    to: req.user.email,
    subject: `BloomBar payment received · ${order.orderId}`,
    text: `Payment confirmed for order ${order.orderId}. Total ₹${order.total}.`,
  });
  getIO()?.to(String(req.user._id)).emit("order:status", { orderId: order.orderId, status: order.status });
  res.json({ order });
});

router.get("/", async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json(orders);
});

router.get("/:orderId", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.json(order);
});

router.post("/:orderId/cancel", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  const blocked = ["Out for Delivery", "Delivered", "Cancelled"];
  if (blocked.includes(order.status)) return res.status(400).json({ message: "This order can no longer be cancelled." });
  order.status = "Cancelled";
  order.cancelled = true;
  order.statusHistory.push({ status: "Cancelled" });
  await order.save();
  for (const i of order.items) {
    if (i.product) await Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity, soldCount: -i.quantity } });
  }
  res.json(order);
});

router.post("/:orderId/reorder", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  for (const i of order.items) {
    cart.items.push({
      kind: i.kind,
      product: i.product,
      customBouquet: i.customBouquet,
      name: i.name,
      image: i.image,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      customSummary: i.customSummary,
    });
  }
  await cart.save();
  res.json({ message: "Items added to cart." });
});

export default router;
