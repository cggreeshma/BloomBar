import { useState } from "react";
import api from "../api/client";
import ProductCard from "../components/ProductCard";

const moods = ["Romantic", "Happy", "Thank You", "Sorry", "Celebration", "Comfort", "Just Because"];

export default function Mood() {
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState("");
  return (
    <div>
      <h1 className="display text-5xl">Mood-based finder</h1>
      <p className="mt-2 text-ink/55">Tell us the feeling. We’ll gather the stems.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {moods.map((m) => (
          <button
            key={m}
            className={`rounded-full px-4 py-2 ${sel === m ? "bg-ink text-white" : "bg-white ring-1 ring-blush-200"}`}
            onClick={async () => {
              setSel(m);
              const { data } = await api.get(`/custom/mood/${m}`);
              setItems(data);
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
