import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api, { formatINR } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const STEPS = ["Order Placed", "Order Confirmed", "Preparing Bouquet", "Ready for Dispatch", "Out for Delivery", "Delivered"];

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const { user } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();

  const load = () => api.get(`/orders/${orderId}`).then((r) => setOrder(r.data));

  useEffect(() => {
    load().catch(() => setOrder(false));
    const socket = io("/", { auth: { token: localStorage.getItem("bb_token") } });
    socket.on("order:status", (p) => {
      if (p.orderId === orderId) load();
    });
    return () => socket.close();
  }, [orderId]);

  if (order === false) return <p>Order not found.</p>;
  if (!order) return <p>Loading…</p>;

  const idx = STEPS.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest">Order</p>
        <h1 className="display text-5xl">{order.orderId}</h1>
        <p className="text-ink/50">
          {order.paymentMethod} · {order.paymentStatus} · Hi {user?.name}
        </p>
      </div>
      {order.status !== "Cancelled" && (
        <div className="card grid gap-3 p-6 md:grid-cols-6">
          {STEPS.map((s, i) => (
            <div key={s} className={`rounded-2xl p-3 text-xs ${i <= idx ? "bg-ink text-white" : "bg-cream-50"}`}>
              {s}
            </div>
          ))}
        </div>
      )}
      {order.status === "Cancelled" && <p className="card p-4 text-blush-600">This order was cancelled.</p>}
      <div className="card space-y-3 p-6">
        {order.items.map((i) => (
          <div key={i._id || i.name} className="flex justify-between">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatINR(i.unitPrice * i.quantity)}</span>
          </div>
        ))}
        <p className="display text-4xl">{formatINR(order.total)}</p>
        <p className="text-sm text-ink/55">
          Deliver to {order.address?.name}, {order.address?.line1}, {order.address?.city} on {order.deliveryDate?.slice(0, 10)} · {order.timeSlot} ({order.deliveryType})
        </p>
        {order.giftMessage && <p className="italic">“{order.giftMessage}”</p>}
      </div>
      <div className="card p-6">
        <h2 className="display text-3xl">Flower care</h2>
        <p className="mt-2 text-ink/65">{order.careGuide}</p>
      </div>
      <div className="flex gap-3">
        {!order.cancelled && !["Out for Delivery", "Delivered", "Cancelled"].includes(order.status) && (
          <button
            className="btn-line"
            onClick={async () => {
              await api.post(`/orders/${order.orderId}/cancel`);
              load();
            }}
          >
            Cancel order
          </button>
        )}
        <button
          className="btn-dark"
          onClick={async () => {
            await api.post(`/orders/${order.orderId}/reorder`);
            await refresh();
            navigate("/cart");
          }}
        >
          Reorder
        </button>
      </div>
    </div>
  );
}
