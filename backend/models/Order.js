import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        kind: { type: String, enum: ["product", "custom"] },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        customBouquet: { type: mongoose.Schema.Types.ObjectId, ref: "CustomBouquet" },
        name: String,
        image: String,
        quantity: Number,
        unitPrice: Number,
        customSummary: String,
        flowerTypes: [String],
      },
    ],
    address: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    recipient: {
      name: String,
      phone: String,
    },
    giftMessage: String,
    deliveryDate: Date,
    timeSlot: String,
    deliveryType: { type: String, enum: ["standard", "express"], default: "standard" },
    subtotal: Number,
    deliveryCharge: Number,
    discount: Number,
    rewardsUsed: { type: Number, default: 0 },
    total: Number,
    couponCode: String,
    paymentMethod: { type: String, enum: ["upi", "card", "netbanking", "cod", "razorpay"] },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: [
        "Order Placed",
        "Order Confirmed",
        "Preparing Bouquet",
        "Ready for Dispatch",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
      },
    ],
    careGuide: String,
    cancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
