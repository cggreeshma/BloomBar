import mongoose from "mongoose";

const ribbonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, default: 0 },
  colors: [String],
  image: String,
});

export default mongoose.model("Ribbon", ribbonSchema);
