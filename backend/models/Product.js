import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    images: [String],
    price: { type: Number, required: true },
    compareAtPrice: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    flowerTypes: [String],
    composition: [
      {
        flower: String,
        quantity: Number,
      },
    ],
    colors: [String],
    occasions: [String],
    moods: [String],
    stock: { type: Number, default: 20 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    deliveryEstimate: { type: String, default: "Same day in select cities" },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    seasonal: { type: Boolean, default: false },
    discountLabel: String,
    careGuide: String,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
