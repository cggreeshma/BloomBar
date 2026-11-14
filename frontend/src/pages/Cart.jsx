import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api, { formatINR } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, totals, updateQty, remove, refresh } = useCart();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h1 className="display text-4xl">Your cart is waiting</h1>
        <p className="mt-3 text-ink/60">Sign in to keep bouquets across devices.</p>
        <Link to="/login?next=/cart" className="btn-dark mt-6 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h1 className="display text-4xl">The basket is empty</h1>
        <Link to="/shop" className="btn-dark mt-6 inline-flex">
          Visit the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <h1 className="display text-5xl">Cart</h1>
        {cart.items.map((i) => (
          <article key={i._id} className="card flex gap-4 p-4">
            <img src={i.image} alt="" className="h-28 w-24 rounded-2xl object-cover" />
            <div className="flex-1">
              <p className="display text-2xl">{i.name}</p>
              {i.customSummary && <p className="text-sm text-ink/50">{i.customSummary}</p>}
              <p>{formatINR(i.unitPrice)}</p>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => updateQty(i._id, i.quantity - 1)}>−</button>
                <span>{i.quantity}</span>
                <button onClick={() => updateQty(i._id, i.quantity + 1)}>+</button>
                <button className="ml-auto text-sm text-blush-600" onClick={() => remove(i._id)}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="card h-fit space-y-3 p-6">
        <p>Subtotal {formatINR(totals.subtotal)}</p>
        <p>Discount −{formatINR(totals.discount)}</p>
        <p>Delivery from {formatINR(totals.deliveryCharge)}</p>
        <p className="display text-4xl">{formatINR(totals.total)}</p>
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon" />
          <button
            className="btn-line !px-4"
            onClick={async () => {
              try {
                setErr("");
                await api.post("/cart/coupon", { code });
                refresh();
              } catch (e) {
                setErr(e.response?.data?.message || "Invalid");
              }
            }}
          >
            Apply
          </button>
        </div>
        {err && <p className="text-sm text-blush-600">{err}</p>}
        <button className="btn-dark w-full" onClick={() => navigate("/checkout")}>
          Checkout
        </button>
      </aside>
    </div>
  );
}
