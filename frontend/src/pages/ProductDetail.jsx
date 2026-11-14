import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { formatINR } from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [img, setImg] = useState(0);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [sort, setSort] = useState("newest");
  const { user } = useAuth();
  const { add, toggleWish, wished } = useCart();
  const navigate = useNavigate();

  const load = () => {
    api.get(`/products/${slug}`).then((r) => {
      setData(r.data);
      setImg(0);
    });
    api.get(`/products/${slug}/reviews`, { params: { sort: sort === "rating" ? "rating" : "newest" } }).then((r) => setReviews(r.data));
  };

  useEffect(load, [slug, sort]);
  if (!data) return <p className="py-20 text-center">Loading…</p>;
  const p = data.product;

  const requireUser = () => {
    if (!user) {
      navigate(`/login?next=/product/${slug}`);
      return false;
    }
    return true;
  };

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <img src={p.images[img]} alt="" className="h-[520px] w-full rounded-[2rem] object-cover" />
          <div className="mt-3 flex gap-2">
            {p.images.map((src, i) => (
              <button key={src} onClick={() => setImg(i)} className={`h-20 w-20 overflow-hidden rounded-2xl ${i === img ? "ring-2 ring-ink" : ""}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/40">{p.category?.name}</p>
          <h1 className="display text-6xl leading-none">{p.name}</h1>
          <p className="text-ink/65">{p.description}</p>
          <p className="text-2xl">
            {formatINR(p.price)}{" "}
            {p.compareAtPrice && <span className="text-base text-ink/30 line-through">{formatINR(p.compareAtPrice)}</span>}
          </p>
          <p className="text-sm">★ {p.rating} · {p.reviewCount} reviews · {p.stock > 0 ? `${p.stock} in atelier` : "Out of stock"}</p>
          <p className="text-sm text-ink/55">Delivery: {p.deliveryEstimate}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {p.colors?.map((c) => (
              <span key={c} className="rounded-full bg-white px-3 py-1 ring-1 ring-blush-200">
                {c}
              </span>
            ))}
            {p.occasions?.map((c) => (
              <span key={c} className="rounded-full bg-sage-50 px-3 py-1">
                {c}
              </span>
            ))}
          </div>
          <p className="text-sm">
            Composition: {p.composition?.map((c) => `${c.quantity} ${c.flower}`).join(" · ") || p.flowerTypes?.join(" · ")}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="btn-dark"
              disabled={p.stock < 1}
              onClick={async () => {
                if (!requireUser()) return;
                await add({ kind: "product", productId: p._id, quantity: 1 });
              }}
            >
              Add to cart
            </button>
            <button
              className="btn-line"
              onClick={async () => {
                if (!requireUser()) return;
                await add({ kind: "product", productId: p._id, quantity: 1 });
                navigate("/checkout");
              }}
            >
              Buy now
            </button>
            <button className="btn-line" onClick={() => requireUser() && toggleWish(p._id)}>
              {wished(p._id) ? "In wishlist" : "Wishlist"}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-4xl">Reviews</h2>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="max-w-[200px]">
            <option value="newest">Newest</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>
        <div className="space-y-4">
          {reviews.map((r) => (
            <article key={r._id} className="card p-5">
              <p className="text-sm font-medium">
                {r.user?.name} · {"★".repeat(r.rating)} {r.verified && <span className="text-sage-700">Verified purchase</span>}
              </p>
              <p className="mt-2 text-ink/70">{r.comment}</p>
            </article>
          ))}
        </div>
        {user && (
          <form
            className="card mt-6 space-y-3 p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api.post(`/products/${slug}/reviews`, form);
              setForm({ rating: 5, comment: "" });
              load();
            }}
          >
            <p className="font-medium">Write a review</p>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
            <textarea rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            <button className="btn-dark">Publish</button>
          </form>
        )}
      </section>

      <section className="mt-16">
        <h2 className="display mb-6 text-4xl">Related</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.related.map((r) => (
            <ProductCard key={r._id} product={r} />
          ))}
        </div>
      </section>
      <p className="mt-8 text-sm">
        <Link to="/care" className="underline">
          Flower care guide
        </Link>
      </p>
    </div>
  );
}
