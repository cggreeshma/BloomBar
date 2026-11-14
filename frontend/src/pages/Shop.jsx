import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0 });
  const [cats, setCats] = useState([]);
  const [quick, setQuick] = useState(null);
  const [loading, setLoading] = useState(true);

  const update = (k, v) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n);
  };

  useEffect(() => {
    api.get("/products/categories").then((r) => setCats(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: Object.fromEntries(params) })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="card h-fit space-y-5 p-5">
        <h1 className="display text-4xl">Shop</h1>
        <label className="block text-xs uppercase tracking-widest text-ink/40">
          Search
          <input className="mt-2" value={params.get("q") || ""} onChange={(e) => update("q", e.target.value)} />
        </label>
        <label className="block text-xs uppercase tracking-widest text-ink/40">
          Category
          <select className="mt-2" value={params.get("category") || ""} onChange={(e) => update("category", e.target.value)}>
            <option value="">All</option>
            {cats.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-widest text-ink/40">
          Flower
          <select className="mt-2" value={params.get("flower") || ""} onChange={(e) => update("flower", e.target.value)}>
            <option value="">All stems</option>
            {["Roses", "Tulips", "Lilies", "Carnations", "Sunflowers", "Peonies", "Orchid"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-widest text-ink/40">
          Colour
          <select className="mt-2" value={params.get("color") || ""} onChange={(e) => update("color", e.target.value)}>
            <option value="">Any</option>
            {["pink", "red", "white", "yellow", "purple", "blush", "peach"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-widest text-ink/40">
          Occasion
          <select className="mt-2" value={params.get("occasion") || ""} onChange={(e) => update("occasion", e.target.value)}>
            <option value="">Any</option>
            {["Birthday", "Anniversary", "Romance", "Thank You", "Wedding", "Sympathy", "Congratulations"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Min ₹" value={params.get("minPrice") || ""} onChange={(e) => update("minPrice", e.target.value)} />
          <input placeholder="Max ₹" value={params.get("maxPrice") || ""} onChange={(e) => update("maxPrice", e.target.value)} />
        </div>
      </aside>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/50">{data.total} bouquets</p>
          <select value={params.get("sort") || "newest"} onChange={(e) => update("sort", e.target.value)}>
            <option value="newest">Newest</option>
            <option value="popularity">Popularity</option>
            <option value="rating">Highest rated</option>
            <option value="price_asc">Price · low</option>
            <option value="price_desc">Price · high</option>
          </select>
        </div>
        {loading ? (
          <p className="py-20 text-center text-ink/40">Arranging stems…</p>
        ) : data.items.length === 0 ? (
          <p className="card p-12 text-center text-ink/50">No bouquets match those filters.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p) => (
              <ProductCard key={p._id} product={p} onQuick={setQuick} />
            ))}
          </div>
        )}
      </div>
      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </div>
  );
}
