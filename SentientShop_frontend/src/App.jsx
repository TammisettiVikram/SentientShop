import { Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Payment from "./pages/Payment";
import UserDashboard from "./pages/UserDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Products />} />
      <Route path="/category/:categorySlug" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
