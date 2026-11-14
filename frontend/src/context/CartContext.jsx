import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, deliveryCharge: 0, total: 0 });
  const [wishlist, setWishlist] = useState([]);

  const apply = (data) => {
    setCart(data.cart);
    setTotals({
      subtotal: data.subtotal,
      discount: data.discount,
      deliveryCharge: data.deliveryCharge,
      total: data.total,
    });
  };

  const refresh = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    const { data } = await api.get("/cart");
    apply(data);
    const wl = await api.get("/user/wishlist");
    setWishlist(wl.data.products || []);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, [user?._id || user?.id]);

  const add = async (payload) => {
    const { data } = await api.post("/cart/add", payload);
    apply(data);
  };

  const updateQty = async (itemId, quantity) => {
    const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
    apply(data);
  };

  const remove = async (itemId) => {
    const { data } = await api.delete(`/cart/item/${itemId}`);
    apply(data);
  };

  const toggleWish = async (productId) => {
    const { data } = await api.post(`/user/wishlist/${productId}`);
    setWishlist(data.products || []);
  };

  const wished = (id) => wishlist.some((p) => (p._id || p) === id);

  const count = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const value = useMemo(
    () => ({ cart, totals, add, updateQty, remove, refresh, count, wishlist, toggleWish, wished }),
    [cart, totals, count, wishlist]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
