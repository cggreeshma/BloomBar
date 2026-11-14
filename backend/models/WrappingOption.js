import mongoose from "mongoose";

const wrappingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, default: 0 },
  image: String,
  color: String,
});

export default mongoose.model("WrappingOption", wrappingSchema);
