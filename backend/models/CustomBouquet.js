import mongoose from "mongoose";
import crypto from "crypto";

const customBouquetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "Custom Bouquet" },
    shareId: { type: String, unique: true },
    flowers: [
      {
        flower: { type: mongoose.Schema.Types.ObjectId, ref: "Flower" },
        name: String,
        image: String,
        quantity: Number,
        unitPrice: Number,
        color: String,
      },
    ],
    size: { type: String, enum: ["small", "medium", "large", "premium"], default: "medium" },
    colorTheme: { type: String, default: "pastel" },
    wrapping: {
      option: { type: mongoose.Schema.Types.ObjectId, ref: "WrappingOption" },
      name: String,
      color: String,
    },
    ribbon: {
      option: { type: mongoose.Schema.Types.ObjectId, ref: "Ribbon" },
      name: String,
      color: String,
    },
    personalTouches: {
      messageCard: String,
      printedName: String,
      tag: String,
      note: String,
      photoUrl: String,
    },
    addOns: [
      {
        addOn: { type: mongoose.Schema.Types.ObjectId, ref: "AddOn" },
        name: String,
        price: Number,
        image: String,
      },
    ],
    totalPrice: { type: Number, default: 0 },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

customBouquetSchema.pre("save", function setShare(next) {
  if (!this.shareId) this.shareId = crypto.randomBytes(6).toString("hex");
  next();
});

export default mongoose.model("CustomBouquet", customBouquetSchema);
