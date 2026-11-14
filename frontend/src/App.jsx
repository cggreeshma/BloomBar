import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Protected from "./components/Protected";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Build from "./pages/Build";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Account, {
  Addresses,
  MyReviews,
  OrdersList,
  ProfileHome,
  RecentView,
  Rewards,
  SavedBouquets,
  Settings,
} from "./pages/Account";
import OrderDetail from "./pages/OrderDetail";
import Wishlist from "./pages/Wishlist";
import Mood from "./pages/Mood";
import Surprise from "./pages/Surprise";
import Budget from "./pages/Budget";
import Schedule from "./pages/Schedule";
import ShareBouquet from "./pages/ShareBouquet";
import { About, Care, Contact, Occasions, Policies } from "./pages/StaticPages";
import Admin from "./pages/admin/Admin";
import {
  AdminOrders,
  AdminProducts,
  AdminReviews,
  Banners,
  Coupons,
  Customers,
  Inventory,
  Overview,
  Slots,
} from "./pages/admin/AdminPages";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/build" element={<Build />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <Protected>
              <Checkout />
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password/:token" element={<Reset />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/surprise" element={<Surprise />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/share/:shareId" element={<ShareBouquet />} />
        <Route path="/occasions" element={<Occasions />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/care" element={<Care />} />
        <Route path="/policies" element={<Policies />} />
        <Route
          path="/orders/:orderId"
          element={
            <Protected>
              <OrderDetail />
            </Protected>
          }
        />
        <Route
          path="/account"
          element={
            <Protected>
              <Account />
            </Protected>
          }
        >
          <Route index element={<ProfileHome />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="saved" element={<SavedBouquets />} />
          <Route path="recent" element={<RecentView />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route
        path="/admin"
        element={
          <Protected admin>
            <Admin />
          </Protected>
        }
      >
        <Route index element={<Overview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="slots" element={<Slots />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="banners" element={<Banners />} />
      </Route>
    </Routes>
  );
}
