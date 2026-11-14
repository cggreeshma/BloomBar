import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { formatINR } from "../api/client";
import BouquetPreview from "../components/BouquetPreview";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ShareBouquet() {
  const { shareId } = useParams();
  const [item, setItem] = useState(null);
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/custom/share/${shareId}`).then((r) => setItem(r.data)).catch(() => setItem(false));
  }, [shareId]);

  if (item === false) return <p>Design not found.</p>;
  if (!item) return <p>Loading…</p>;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <BouquetPreview flowers={item.flowers} wrapping={item.wrapping} ribbon={item.ribbon} size={item.size} />
      <div>
        <p className="text-xs uppercase tracking-widest">Shared design</p>
        <h1 className="display text-5xl">{item.name}</h1>
        <p className="mt-2">{item.size} · {item.colorTheme}</p>
        <p className="display mt-4 text-4xl">{formatINR(item.totalPrice)}</p>
        <p className="mt-3 text-sm text-ink/60">{item.flowers?.map((f) => `${f.quantity}× ${f.name}`).join(" · ")}</p>
        <p className="mt-4 text-sm">Share this page: {window.location.href}</p>
        <button
          className="btn-dark mt-6"
          onClick={async () => {
            if (!user) return navigate("/login");
            await add({ kind: "custom", customBouquetId: item._id, quantity: 1 });
            navigate("/cart");
          }}
        >
          Add this design
        </button>
      </div>
    </div>
  );
}
