import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const links = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Build Your Bouquet", "/build"],
  ["Occasions", "/occasions"],
  ["About Us", "/about"],
  ["Contact", "/contact"],
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const search = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-blush-100/80 bg-cream-50/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="display text-3xl tracking-tight text-ink">
          Bloom<span className="italic text-blush-500">Bar</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink/70 lg:flex">
          {links.map(([label, href]) => (
            <NavLink key={href} to={href} className={({ isActive }) => (isActive ? "text-ink" : "hover:text-ink")}>
              {label}
            </NavLink>
          ))}
        </nav>
        <form onSubmit={search} className="hidden min-w-[220px] flex-1 md:block lg:max-w-xs">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search flowers, colour, occasion" />
        </form>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/wishlist" className="hidden sm:inline hover:text-blush-600">
            Wishlist
          </Link>
          <Link to="/cart" className="relative">
            Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-blush-500 px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link to={user.role === "admin" ? "/admin" : "/account"} className="btn-dark !px-4 !py-2">
              {user.role === "admin" ? "Atelier" : "Account"}
            </Link>
          ) : (
            <Link to="/login" className="btn-dark !px-4 !py-2">
              Sign in
            </Link>
          )}
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            Menu
          </button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-blush-100 px-4 py-4 lg:hidden">
          {links.map(([label, href]) => (
            <Link key={href} to={href} className="block" onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
