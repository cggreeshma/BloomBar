import mongoose from "mongoose";

const flowerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    price: { type: Number, required: true },
    colors: [String],
    stock: { type: Number, default: 100 },
    mood: [String],
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Flower", flowerSchema);
