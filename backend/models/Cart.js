import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  kind: { type: String, enum: ["product", "custom"], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  customBouquet: { type: mongoose.Schema.Types.ObjectId, ref: "CustomBouquet" },
  name: String,
  image: String,
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: Number,
  customSummary: String,
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    items: [cartItemSchema],
    couponCode: String,
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
