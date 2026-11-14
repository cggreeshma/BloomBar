import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatINR } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { cart, totals, refresh } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [slots, setSlots] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [recipient, setRecipient] = useState({ name: "", phone: "" });
  const [giftMessage, setGiftMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [useRewards, setUseRewards] = useState(0);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user/addresses").then((r) => {
      setAddresses(r.data);
      const d = r.data.find((a) => a.isDefault) || r.data[0];
      if (d) setAddressId(d._id);
    });
    api.get("/orders/slots").then((r) => {
      setSlots(r.data);
      if (r.data[0]) setTimeSlot(r.data[0].label);
    });
  }, []);

  if (!cart?.items?.length) return <p>Your cart is empty.</p>;

  const pay = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const body = {
        addressId: addressId || undefined,
        address: addressId ? undefined : form,
        recipient,
        giftMessage,
        deliveryDate,
        timeSlot,
        deliveryType,
        paymentMethod,
        useRewards,
      };
      if (!addressId) {
        if (!form.line1 || !form.city || !form.pincode) {
          setErr("Please complete the delivery address.");
          return;
        }
      }
      const { data } = await api.post("/orders/checkout", body);
      if (data.payNow && data.demoCheckout) {
        await api.post(`/orders/pay/${data.order.orderId}`, { demo: true });
      } else if (data.payNow && data.razorpay && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: data.razorpay.key,
          amount: data.razorpay.amount,
          order_id: data.razorpay.orderId,
          handler: async (resp) => {
            await api.post(`/orders/pay/${data.order.orderId}`, resp);
            await refresh();
            navigate(`/orders/${data.order.orderId}`);
          },
        });
        rzp.open();
        return;
      } else if (data.payNow && !data.demoCheckout) {
        await api.post(`/orders/pay/${data.order.orderId}`, { demo: true });
      }
      await refresh();
      navigate(`/orders/${data.order.orderId}`);
    } catch (e2) {
      setErr(e2.response?.data?.message || "Checkout failed");
    }
  };

  return (
    <form onSubmit={pay} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <h1 className="display text-5xl">Checkout</h1>
        <section className="card space-y-3 p-6">
          <h2 className="display text-3xl">Delivery</h2>
          {addresses.map((a) => (
            <label key={a._id} className="flex items-start gap-3 rounded-2xl bg-cream-50 p-3">
              <input type="radio" checked={addressId === a._id} onChange={() => setAddressId(a._id)} />
              <span>
                {a.name}, {a.line1}, {a.city} {a.pincode}
              </span>
            </label>
          ))}
          <button type="button" className="text-sm underline" onClick={() => setAddressId("")}>
            New address
          </button>
          {!addressId && (
            <div className="grid gap-3 sm:grid-cols-2">
              {["name", "phone", "line1", "city", "state", "pincode"].map((k) => (
                <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              ))}
            </div>
          )}
          <input type="date" required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            {slots.map((s) => (
              <option key={s._id}>{s.label}</option>
            ))}
          </select>
          <div className="flex gap-3">
            {["standard", "express"].map((t) => (
              <button type="button" key={t} onClick={() => setDeliveryType(t)} className={`flex-1 rounded-2xl p-3 capitalize ${deliveryType === t ? "bg-ink text-white" : "bg-cream-50"}`}>
                {t}
              </button>
            ))}
          </div>
        </section>
        <section className="card space-y-3 p-6">
          <h2 className="display text-3xl">Recipient</h2>
          <input placeholder="Recipient name" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} />
          <input placeholder="Recipient phone" value={recipient.phone} onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })} />
          <textarea placeholder="Gift message" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />
        </section>
        <section className="card space-y-3 p-6">
          <h2 className="display text-3xl">Payment</h2>
          {["upi", "card", "netbanking", "cod", "razorpay"].map((m) => (
            <label key={m} className="flex items-center gap-2 capitalize">
              <input type="radio" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} /> {m === "cod" ? "Cash on delivery" : m}
            </label>
          ))}
          <label className="block text-sm">
            Use Bloom Rewards (you have {user.rewardPoints || 0})
            <input type="number" min="0" max={user.rewardPoints || 0} value={useRewards} onChange={(e) => setUseRewards(Number(e.target.value))} />
          </label>
        </section>
      </div>
      <aside className="card h-fit space-y-3 p-6">
        {cart.items.map((i) => (
          <p key={i._id} className="flex justify-between text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatINR(i.unitPrice * i.quantity)}</span>
          </p>
        ))}
        <p>Subtotal {formatINR(totals.subtotal)}</p>
        <p className="display text-4xl">{formatINR(totals.total)}</p>
        {err && <p className="text-blush-600">{err}</p>}
        <button className="btn-dark w-full">Place order</button>
        <p className="text-xs text-ink/40">Demo payments complete instantly when Razorpay keys are not set. COD remains unpaid until delivery.</p>
      </aside>
    </form>
  );
}
