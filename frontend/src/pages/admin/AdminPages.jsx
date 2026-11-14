import { useEffect, useState } from "react";
import api, { formatINR } from "../../api/client";

export function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then((r) => setS(r.data));
  }, []);
  if (!s) return <p>Loading…</p>;
  return (
    <div>
      <h1 className="display text-5xl">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Revenue", formatINR(s.revenue)],
          ["Orders", s.orders],
          ["Customers", s.users],
          ["Bouquets", s.products],
        ].map(([l, v]) => (
          <div key={l} className="card p-5">
            <p className="text-xs uppercase tracking-widest text-ink/40">{l}</p>
            <p className="display text-4xl">{v}</p>
          </div>
        ))}
      </div>
      <h2 className="display mt-10 text-3xl">Sales</h2>
      <div className="mt-4 flex h-40 items-end gap-2">
        {s.byDay.map((d) => (
          <div key={d._id} className="flex-1 rounded-t-lg bg-blush-300" style={{ height: `${Math.min(100, d.sales / 80)}%` }} title={`${d._id} ${d.sales}`} />
        ))}
      </div>
      <h2 className="display mt-10 text-3xl">Low stock</h2>
      <p className="text-sm text-ink/50">{s.lowProducts.map((p) => p.name).join(" · ") || "All healthy"}</p>
    </div>
  );
}

export function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    images: "",
    price: 1500,
    stock: 10,
    flowerTypes: "Roses",
    colors: "pink",
    occasions: "Birthday",
    category: "",
  });
  const load = () => {
    api.get("/admin/products").then((r) => setItems(r.data));
    api.get("/admin/categories").then((r) => setCats(r.data));
  };
  useEffect(load, []);

  return (
    <div>
      <h1 className="display text-4xl">Products</h1>
      <form
        className="card my-6 grid gap-2 p-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.post("/admin/products", {
            ...form,
            images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
            flowerTypes: form.flowerTypes.split(",").map((s) => s.trim()),
            colors: form.colors.split(",").map((s) => s.trim()),
            occasions: form.occasions.split(",").map((s) => s.trim()),
            price: Number(form.price),
            stock: Number(form.stock),
          });
          load();
        }}
      >
        {["name", "slug", "description", "images", "price", "stock", "flowerTypes", "colors", "occasions"].map((k) => (
          <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        ))}
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="">Category</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn-dark">Add product</button>
      </form>
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p._id} className="card flex items-center justify-between p-4">
            <span>
              {p.name} · {formatINR(p.price)} · stock {p.stock}
            </span>
            <button
              className="text-blush-600"
              onClick={async () => {
                await api.delete(`/admin/products/${p._id}`);
                load();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Inventory() {
  const [flowers, setFlowers] = useState([]);
  useEffect(() => {
    api.get("/admin/flowers").then((r) => setFlowers(r.data));
  }, []);
  return (
    <div>
      <h1 className="display text-4xl">Flower inventory</h1>
      {flowers.map((f) => (
        <div key={f._id} className="card mt-3 flex items-center justify-between p-4">
          <span>
            {f.name} · {f.stock} stems
          </span>
          <input
            className="max-w-[120px]"
            type="number"
            defaultValue={f.stock}
            onBlur={async (e) => {
              await api.put(`/admin/flowers/${f._id}`, { stock: Number(e.target.value) });
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/admin/orders").then((r) => setOrders(r.data));
  useEffect(load, []);
  return (
    <div>
      <h1 className="display text-4xl">Orders</h1>
      {orders.map((o) => (
        <div key={o._id} className="card mt-3 p-4">
          <p>
            {o.orderId} · {o.user?.name} · {formatINR(o.total)}
          </p>
          <select
            className="mt-2 max-w-xs"
            value={o.status}
            onChange={async (e) => {
              await api.put(`/admin/orders/${o._id}`, { status: e.target.value });
              load();
            }}
          >
            {["Order Placed", "Order Confirmed", "Preparing Bouquet", "Ready for Dispatch", "Out for Delivery", "Delivered", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export function Customers() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get("/admin/customers").then((r) => setRows(r.data));
  }, []);
  return (
    <div>
      <h1 className="display text-4xl">Customers</h1>
      {rows.map((u) => (
        <p key={u._id} className="card mt-2 p-4">
          {u.name} · {u.email} · {u.phone}
        </p>
      ))}
    </div>
  );
}

export function Coupons() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ code: "", type: "percent", value: 10, minOrder: 0, description: "" });
  const load = () => api.get("/admin/coupons").then((r) => setRows(r.data));
  useEffect(load, []);
  return (
    <div>
      <h1 className="display text-4xl">Coupons</h1>
      <form
        className="card my-4 grid gap-2 p-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.post("/admin/coupons", { ...form, value: Number(form.value), minOrder: Number(form.minOrder) });
          load();
        }}
      >
        <input placeholder="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="percent">percent</option>
          <option value="fixed">fixed</option>
        </select>
        <input placeholder="value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <input placeholder="min order" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
        <input placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-dark">Add</button>
      </form>
      {rows.map((c) => (
        <p key={c._id} className="card mt-2 flex justify-between p-4">
          {c.code} · {c.description}
          <button onClick={() => api.delete(`/admin/coupons/${c._id}`).then(load)}>Delete</button>
        </p>
      ))}
    </div>
  );
}

export function Slots() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/admin/slots").then((r) => setRows(r.data));
  useEffect(load, []);
  return (
    <div>
      <h1 className="display text-4xl">Delivery slots</h1>
      {rows.map((s) => (
        <p key={s._id} className="card mt-2 p-4">
          {s.label} {s.start}–{s.end}
        </p>
      ))}
      <button
        className="btn-dark mt-4"
        onClick={async () => {
          await api.post("/admin/slots", { label: "Late night", start: "21:00", end: "22:00", active: true });
          load();
        }}
      >
        Add late slot
      </button>
    </div>
  );
}

export function AdminReviews() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/admin/reviews").then((r) => setRows(r.data));
  useEffect(load, []);
  return (
    <div>
      <h1 className="display text-4xl">Reviews</h1>
      {rows.map((r) => (
        <div key={r._id} className="card mt-2 flex justify-between p-4">
          <span>
            {r.product?.name} · {r.user?.name} · {r.rating}★ · {r.comment}
          </span>
          <button onClick={() => api.delete(`/admin/reviews/${r._id}`).then(load)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export function Banners() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/admin/banners").then((r) => setRows(r.data));
  useEffect(load, []);
  return (
    <div>
      <h1 className="display text-4xl">Banners</h1>
      {rows.map((b) => (
        <p key={b._id} className="card mt-2 p-4">
          {b.title}
        </p>
      ))}
    </div>
  );
}
