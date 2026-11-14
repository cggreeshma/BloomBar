import mongoose from "mongoose";

const addOnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  image: String,
  category: { type: String, enum: ["chocolate", "teddy", "card", "perfume", "hamper"] },
});

export default mongoose.model("AddOn", addOnSchema);
