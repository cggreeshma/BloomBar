import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatINR } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Budget() {
  const [budget, setBudget] = useState(1800);
  const [plan, setPlan] = useState(null);
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-xl">
      <h1 className="display text-5xl">Budget builder</h1>
      <input className="mt-6" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
      <button
        className="btn-dark mt-3"
        onClick={async () => setPlan((await api.post("/custom/budget-builder", { budget })).data)}
      >
        Recommend
      </button>
      {plan && (
        <div className="card mt-6 space-y-2 p-6">
          {plan.flowers.map((f) => (
            <p key={f.name}>
              {f.quantity}× {f.name}
            </p>
          ))}
          <p>Wrap: {plan.wrapping?.name}</p>
          <p>Ribbon: {plan.ribbon?.name}</p>
          <p>Total {formatINR(plan.totalPrice)} · remaining {formatINR(plan.remaining)}</p>
          <button
            className="btn-dark"
            onClick={async () => {
              if (!user) return navigate("/login");
              const { data } = await api.post("/custom", {
                flowers: plan.flowers,
                size: "medium",
                wrapping: { option: plan.wrapping?._id, name: plan.wrapping?.name, color: plan.wrapping?.color },
                ribbon: { option: plan.ribbon?._id, name: plan.ribbon?.name, color: plan.ribbon?.colors?.[0] },
                addOns: plan.addOns,
                saved: true,
              });
              await add({ kind: "custom", customBouquetId: data._id });
              navigate("/cart");
            }}
          >
            Add recommended
          </button>
        </div>
      )}
    </div>
  );
}
