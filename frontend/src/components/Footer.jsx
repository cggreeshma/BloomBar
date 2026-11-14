import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/client";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const subscribe = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/user/newsletter", { email });
    setMsg(data.message);
    setEmail("");
  };

  return (
    <footer className="mt-24 border-t border-blush-100 bg-cream-100/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4">
        <div>
          <p className="display text-3xl">BloomBar</p>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            A quiet flower boutique for considered gifts. Atelier wrapping, same-day stems, and a studio to design your own.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Maison</p>
          <div className="space-y-2 text-ink/65">
            <Link to="/about" className="block">About Us</Link>
            <Link to="/shop" className="block">Shop</Link>
            <Link to="/build" className="block">Build Your Bouquet</Link>
            <Link to="/care" className="block">Flower Care</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Policies</p>
          <div className="space-y-2 text-ink/65">
            <Link to="/policies" className="block">Shipping & returns</Link>
            <Link to="/policies" className="block">Privacy</Link>
            <Link to="/contact" className="block">Contact</Link>
          </div>
        </div>
        <form onSubmit={subscribe} className="text-sm">
          <p className="mb-3 font-medium">The journal</p>
          <p className="mb-3 text-ink/60">Seasonal notes and atelier offers.</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" required />
          <button className="btn-dark mt-3 w-full">Subscribe</button>
          {msg && <p className="mt-2 text-sage-700">{msg}</p>}
        </form>
      </div>
      <div className="border-t border-blush-100 px-4 py-6 text-center text-xs text-ink/45">
        BloomBar Atelier · Bengaluru · Instagram · Pinterest · © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
