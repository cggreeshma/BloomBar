import { Link, useNavigate } from "react-router-dom";
import { formatINR } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function QuickView({ product, onClose }) {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div className="card grid max-w-3xl overflow-hidden md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        <img src={product.images?.[0]} alt="" className="h-72 w-full object-cover md:h-full" />
        <div className="space-y-4 p-6">
          <p className="display text-4xl">{product.name}</p>
          <p className="text-ink/60">{product.description}</p>
          <p className="text-lg">{formatINR(product.price)}</p>
          <div className="flex gap-3">
            <button
              className="btn-dark"
              onClick={async () => {
                if (!user) return navigate("/login");
                await add({ kind: "product", productId: product._id, quantity: 1 });
                onClose();
              }}
            >
              Add to cart
            </button>
            <Link to={`/product/${product.slug}`} className="btn-line" onClick={onClose}>
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
