import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  label: String,
  start: String,
  end: String,
  active: { type: Boolean, default: true },
});

export default mongoose.model("DeliverySlot", slotSchema);
