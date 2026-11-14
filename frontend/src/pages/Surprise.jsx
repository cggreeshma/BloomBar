import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatINR } from "../api/client";
import BouquetPreview from "../components/BouquetPreview";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Surprise() {
  const [budget, setBudget] = useState(2000);
  const [color, setColor] = useState("pink");
  const [design, setDesign] = useState(null);
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="display text-5xl">Surprise me</h1>
        <p className="mt-2 text-ink/55">A composed bouquet within your budget and colour.</p>
        <div className="card mt-6 space-y-3 p-6">
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            {["pink", "red", "white", "yellow", "purple"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            className="btn-dark"
            onClick={async () => {
              const { data } = await api.post("/custom/surprise", { budget, color });
              setDesign(data);
            }}
          >
            Compose
          </button>
        </div>
        <p className="mt-6 text-sm">
          Prefer a guided budget mix? <a className="underline" href="/budget">Open budget builder</a>
        </p>
      </div>
      {design && (
        <div className="space-y-4">
          <BouquetPreview flowers={design.flowers} wrapping={design.wrapping} ribbon={design.ribbon} size={design.size} />
          <p className="display text-4xl">{formatINR(design.totalPrice)}</p>
          <button
            className="btn-dark"
            onClick={async () => {
              if (!user) return navigate("/login?next=/surprise");
              const { data } = await api.post("/custom", { ...design, saved: true });
              await add({ kind: "custom", customBouquetId: data._id, quantity: 1 });
              navigate("/cart");
            }}
          >
            Add this surprise
          </button>
        </div>
      )}
    </div>
  );
}
