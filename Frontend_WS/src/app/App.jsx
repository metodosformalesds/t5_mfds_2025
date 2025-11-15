import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../features/Home";
import Login from "../features/Login";
import Register from "../features/Register";
import VerifyEmail from "../features/VerifyEmail";
import Publish from "../features/Publish"; 
import Layout from "../Shared/components/Layout";

// Placeholder components (para las que aún no están implementadas)
const Shop = () => <div style={{ padding: "2rem" }}><h2>🛍️ Shop Page</h2></div>;
const Category = () => <div style={{ padding: "2rem" }}><h2>📂 Category Page</h2></div>;
const Nursery = () => <div style={{ padding: "2rem" }}><h2>🌿 Nursery Page</h2></div>;
const Exchange = () => <div style={{ padding: "2rem" }}><h2>🔄 Exchange Page</h2></div>;
const Cart = () => <div style={{ padding: "2rem" }}><h2>🛒 Cart Page</h2></div>;
const Profile = () => <div style={{ padding: "2rem" }}><h2>👤 Profile Page</h2></div>;
const Orders = () => <div style={{ padding: "2rem" }}><h2>📦 Orders Page</h2></div>;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas (sin Header) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Rutas protegidas (con Header) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category" element={<Category />} />
          <Route path="/nursery" element={<Nursery />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/publish" element={<Publish />} />  {/* ← CAMBIAR ESTA LÍNEA */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
