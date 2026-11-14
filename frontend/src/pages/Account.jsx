import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const tabs = [
  ["Profile", "/account"],
  ["Orders", "/account/orders"],
  ["Wishlist", "/wishlist"],
  ["Addresses", "/account/addresses"],
  ["Saved bouquets", "/account/saved"],
  ["Recently viewed", "/account/recent"],
  ["Reviews", "/account/reviews"],
  ["Rewards", "/account/rewards"],
  ["Settings", "/account/settings"],
];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="card h-fit space-y-2 p-5">
        <p className="display text-3xl">{user?.name}</p>
        <p className="text-xs text-ink/45">{user?.email}</p>
        {tabs.map(([l, h]) => (
          <NavLink key={h} to={h} end={h === "/account"} className={({ isActive }) => `block rounded-xl px-3 py-2 text-sm ${isActive ? "bg-ink text-white" : "hover:bg-cream-100"}`}>
            {l}
          </NavLink>
        ))}
        <button
          className="text-left text-sm text-blush-600"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Sign out
        </button>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export function ProfileHome() {
  const { user, persist } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  return (
    <form
      className="card max-w-lg space-y-3 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const { data } = await api.put("/auth/profile", form);
        persist(localStorage.getItem("bb_token"), data);
      }}
    >
      <h1 className="display text-4xl">Profile</h1>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <p className="text-sm text-ink/50">{user?.email}</p>
      <button className="btn-dark">Save</button>
    </form>
  );
}

export function OrdersList() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get("/orders").then((r) => setOrders(r.data));
  }, []);
  if (!orders.length) return <p className="card p-8">No orders yet.</p>;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link key={o._id} to={`/orders/${o.orderId}`} className="card flex justify-between p-5">
          <div>
            <p className="font-medium">{o.orderId}</p>
            <p className="text-sm text-ink/50">{o.status} · {o.paymentStatus}</p>
          </div>
          <p>₹{o.total}</p>
        </Link>
      ))}
    </div>
  );
}

export function Addresses() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ label: "Home", name: "", phone: "", line1: "", city: "", state: "", pincode: "", isDefault: true });
  const load = () => api.get("/user/addresses").then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {list.map((a) => (
        <article key={a._id} className="card p-5">
          <p className="font-medium">{a.label}</p>
          <p className="text-sm text-ink/60">
            {a.name}, {a.line1}, {a.city} {a.pincode}
          </p>
          <button className="mt-2 text-sm text-blush-600" onClick={() => api.delete(`/user/addresses/${a._id}`).then(load)}>
            Remove
          </button>
        </article>
      ))}
      <form
        className="card space-y-2 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.post("/user/addresses", form);
          load();
        }}
      >
        <p className="display text-3xl">New address</p>
        {Object.keys(form)
          .filter((k) => k !== "isDefault")
          .map((k) => (
            <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
        <button className="btn-dark">Save address</button>
      </form>
    </div>
  );
}

export function SavedBouquets() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/custom/saved").then((r) => setItems(r.data));
  }, []);
  if (!items.length) return <p className="card p-8">No saved designs yet. Visit the studio.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((i) => (
        <Link key={i._id} to={`/share/${i.shareId}`} className="card p-5">
          <p className="display text-3xl">{i.name}</p>
          <p className="text-sm">{i.size} · {i.colorTheme}</p>
          <p>₹{i.totalPrice}</p>
        </Link>
      ))}
    </div>
  );
}

export function RecentView() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/user/recent").then((r) => setItems(r.data));
  }, []);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((p) => (
        <Link key={p._id} to={`/product/${p.slug}`} className="card flex gap-3 p-3">
          <img src={p.images?.[0]} className="h-20 w-16 rounded-xl object-cover" alt="" />
          <p>{p.name}</p>
        </Link>
      ))}
    </div>
  );
}

export function MyReviews() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/user/reviews").then((r) => setItems(r.data));
  }, []);
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <article key={r._id} className="card p-5">
          <p>{r.product?.name} · {"★".repeat(r.rating)}</p>
          <p className="text-ink/60">{r.comment}</p>
        </article>
      ))}
    </div>
  );
}

export function Rewards() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/user/rewards").then((r) => setData(r.data));
  }, []);
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="card p-8">
        <p className="text-xs uppercase tracking-widest">Bloom Rewards</p>
        <p className="display text-6xl">{data.points}</p>
        <p className="text-sm text-ink/50">1 point per ₹50 · redeem at checkout</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {data.coupons.map((c) => (
          <div key={c._id} className="card p-4">
            <p className="font-medium">{c.code}</p>
            <p className="text-sm text-ink/55">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Settings() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  return (
    <form
      className="card max-w-md space-y-3 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const { data } = await api.put("/auth/password", form);
        setMsg(data.message);
      }}
    >
      <h2 className="display text-3xl">Password</h2>
      <input type="password" placeholder="Current" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      <input type="password" placeholder="New" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
      <button className="btn-dark">Update</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
