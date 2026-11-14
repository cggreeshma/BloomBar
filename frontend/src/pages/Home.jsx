import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";

const gallery = [
  "https://images.unsplash.com/photo-1468327768560-75b60c6f4d32?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c43?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1470509037390-7d9e6c0f0d3c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=600&q=80",
];

const quotes = [
  { n: "Meera K.", t: "The wrapping felt like a letter. Blush Atelier lasted a full week on my table." },
  { n: "Arjun P.", t: "Custom studio was intuitive — she cried, which I will take as a success." },
  { n: "Leah S.", t: "Quiet luxury, not foam and cellophane. Finally a florist that understands proportion." },
];

export default function Home() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [quick, setQuick] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products/home").then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="py-24 text-center text-ink/40">Gathering the garden…</p>;

  const Section = ({ title, kicker, items }) =>
    items?.length ? (
      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink/40">{kicker}</p>
            <h2 className="display text-4xl md:text-5xl">{title}</h2>
          </div>
          <Link to="/shop" className="text-sm text-ink/50 hover:text-ink">
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} onQuick={setQuick} />
          ))}
        </div>
      </section>
    ) : null;

  return (
    <div>
      <section className="relative overflow-hidden rounded-[2.2rem] bg-ink text-cream-50">
        <img
          src="https://images.unsplash.com/photo-1468327768560-75b60c6f4d32?auto=format&fit=crop&w=1600&q=80"
          alt="BloomBar arrangement"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="relative grid min-h-[78vh] items-end gap-8 p-8 md:p-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cream-200">Bengaluru atelier</p>
            <h1 className="display mt-3 text-5xl leading-[0.95] md:text-7xl">Flowers, considered.</h1>
            <p className="mt-5 max-w-md text-cream-100/80">
              Ready-made bouquets and a private customisation studio. Soft palettes, honest stems, silk wrapping.
            </p>
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/shop?q=${encodeURIComponent(q)}`);
              }}
            >
              <input
                className="bg-white/90 text-ink"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, flower, colour or occasion"
              />
              <button className="btn-dark bg-cream-50 !text-ink">Search</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-line border-white/30 bg-white/10 text-white">
                Shop bouquets
              </Link>
              <Link to="/build" className="btn-line border-white/30 bg-white/10 text-white">
                Build your own
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.categories.map((c) => (
          <Link key={c._id} to={`/shop?category=${c.slug}`} className="group relative overflow-hidden rounded-[1.6rem]">
            <img src={c.image} alt="" className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <p className="absolute bottom-4 left-4 display text-3xl text-white">{c.name}</p>
          </Link>
        ))}
      </section>

      <Section title="Featured collections" kicker="This week" items={data.featured} />
      <Section title="Best-selling" kicker="Beloved" items={data.bestsellers} />
      <Section title="New arrivals" kicker="Just gathered" items={data.newArrivals} />
      <Section title="Trending" kicker="On the table" items={data.trending} />
      <Section title="Seasonal" kicker="The garden now" items={data.seasonal} />

      <section className="mt-20 overflow-hidden rounded-[2rem] bg-sage-700 p-8 text-cream-50 md:flex md:items-center md:justify-between md:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] opacity-70">Offer</p>
          <h2 className="display text-5xl">Bloom10 · 10% off atelier orders</h2>
          <p className="mt-2 max-w-md text-cream-100/80">Use WELCOME250 above ₹2,000. Rewards points on every purchase.</p>
        </div>
        <Link to="/shop" className="btn mt-6 bg-cream-50 text-ink md:mt-0">
          Redeem in shop
        </Link>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {quotes.map((q) => (
          <blockquote key={q.n} className="card p-8">
            <p className="display text-2xl leading-snug">“{q.t}”</p>
            <p className="mt-4 text-sm text-ink/50">{q.n}</p>
          </blockquote>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="display mb-6 text-4xl">Studio journal</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {gallery.map((src) => (
            <img key={src} src={src} alt="" className="h-40 w-full rounded-2xl object-cover" />
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        <Link to="/mood" className="card p-6">
          <p className="display text-3xl">Mood finder</p>
          <p className="mt-2 text-sm text-ink/55">Let feeling choose the bouquet.</p>
        </Link>
        <Link to="/surprise" className="card p-6">
          <p className="display text-3xl">Surprise me</p>
          <p className="mt-2 text-sm text-ink/55">Budget and colour. We compose the rest.</p>
        </Link>
        <Link to="/schedule" className="card p-6">
          <p className="display text-3xl">Gift scheduler</p>
          <p className="mt-2 text-sm text-ink/55">Never miss an anniversary again.</p>
        </Link>
      </section>
      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </div>
  );
}
