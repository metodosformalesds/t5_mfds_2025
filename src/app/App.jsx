import React from "react";
import { Routes, Route } from "react-router-dom";

import "../features/login-signup/pages/loginsignup.css";
import "../features/perfil/pages/userperfil.css";

import { LoginSignup } from "../features/login-signup/pages/login-signup.jsx";
import UserPerfil from "../features/perfil/pages/user-perfil.jsx";
import Perfil from "../features/perfil/pages/UserProfile.jsx";
import PaymentPage from "../features/pago/pages/PaymentPage.jsx";
import ProductsModule from "../features/products/ProductsModule.jsx";
import SellerProfile from "../features/perfil/pages/SellerProfile.jsx";
import "./App.css";

const mockProducts = []; // aquí van tus productos reales
const mockSellers = [];

function App() {
  return (
    <Routes>
      {/* Inicio / Login */}
      <Route path="/login" element={<LoginSignup />} />

      {/* Perfil público del usuario (vista resumen) */}
      <Route path="/perfil" element={<Perfil />} />

      {/* Panel de edición de perfil con sidebar */}
      <Route path="/editarPerfil" element={<UserPerfil />} />
      <Route path="/editarPerfil/:activepage" element={<UserPerfil />} />

      {/* Checkout */}
      <Route path="/checkout" element={<PaymentPage />} />

      {/* Productos (módulo completo) */}
      <Route path="/productos/*" element={<ProductsModule />} />

      {/* Perfil de vendedor */}
      <Route
        path="/vendedores/:sellerId"
        element={
          <SellerProfile sellers={mockSellers} products={mockProducts} />
        }
      />
    </Routes>
  );
}

export default App;
