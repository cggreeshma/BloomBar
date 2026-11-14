import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  ["Overview", "/admin"],
  ["Products", "/admin/products"],
  ["Inventory", "/admin/inventory"],
  ["Orders", "/admin/orders"],
  ["Customers", "/admin/customers"],
  ["Coupons", "/admin/coupons"],
  ["Slots", "/admin/slots"],
  ["Reviews", "/admin/reviews"],
  ["Banners", "/admin/banners"],
];

export default function Admin() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="flex">
        <aside className="min-h-screen w-56 border-r border-blush-100 p-5">
          <p className="display text-3xl">Atelier</p>
          <p className="mb-6 text-xs text-ink/40">{user?.email}</p>
          {links.map(([l, h]) => (
            <NavLink key={h} to={h} end={h === "/admin"} className={({ isActive }) => `mb-1 block rounded-xl px-3 py-2 text-sm ${isActive ? "bg-ink text-white" : ""}`}>
              {l}
            </NavLink>
          ))}
          <NavLink to="/" className="mt-6 block text-sm text-ink/50">
            Storefront
          </NavLink>
          <button className="mt-2 text-sm" onClick={logout}>
            Sign out
          </button>
        </aside>
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
