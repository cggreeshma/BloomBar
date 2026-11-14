import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatINR } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, onQuick }) {
  const { user } = useAuth();
  const { add, toggleWish, wished } = useCart();
  const navigate = useNavigate();

  const addCart = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login?next=/cart");
    await add({ kind: "product", productId: product._id, quantity: 1 });
  };

  return (
    <motion.article layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card group">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {product.discountLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-cream-50/90 px-3 py-1 text-[11px] tracking-wide">
            {product.discountLabel}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!user) return navigate("/login");
            toggleWish(product._id);
          }}
          className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs"
        >
          {wished(product._id) ? "Saved" : "Save"}
        </button>
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">{product.category?.name || product.flowerTypes?.[0]}</p>
        <Link to={`/product/${product.slug}`} className="display text-2xl leading-none">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span>{formatINR(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-ink/35 line-through">{formatINR(product.compareAtPrice)}</span>
          )}
        </div>
        <p className="text-xs text-ink/50">★ {product.rating} · {product.reviewCount} reviews</p>
        <div className="flex gap-2 pt-1">
          <button onClick={addCart} className="btn-dark flex-1 !py-2 text-xs">
            Add to cart
          </button>
          {onQuick && (
            <button onClick={() => onQuick(product)} className="btn-line !px-3 !py-2 text-xs">
              View
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
