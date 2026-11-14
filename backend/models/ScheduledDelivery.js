import mongoose from "mongoose";

const scheduledSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    occasion: String,
    date: Date,
    recurring: { type: Boolean, default: false },
    reminder: { type: Boolean, default: true },
    notes: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    customBouquet: { type: mongoose.Schema.Types.ObjectId, ref: "CustomBouquet" },
  },
  { timestamps: true }
);

export default mongoose.model("ScheduledDelivery", scheduledSchema);
