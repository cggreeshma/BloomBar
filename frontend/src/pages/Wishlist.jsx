import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { user } = useAuth();
  const { wishlist } = useCart();
  if (!user) return <Link to="/login">Sign in to view wishlist</Link>;
  if (!wishlist.length) return <p className="card p-10">Your wishlist is a blank page. Wander the shop.</p>;
  return (
    <div>
      <h1 className="display mb-6 text-5xl">Wishlist</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
