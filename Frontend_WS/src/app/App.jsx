// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
import Home from "../features/Home";
import Login from "../features/Login";
import Register from "../features/Register";
import VerifyEmail from "../features/VerifyEmail";
/*Rutas de nuevas views Y rutas en espera*/ 
import Footer from "../features/Footer";
import Shop from "../features/Shop";
import ShoppingCar from "../features/ShoppingCar";
import Navbar from "../features/Navbar";
import ProductDetail from "../features/ProductDetail";
import Publish from "../features/Publish";
import Terms from "../features/Terms";
import About from "../features/AboutUS";
{/*import Category from "../features/Category";
=======

import Home from "../features/Home.jsx";
import VerifyEmail from "../features/VerifyEmail.jsx";

import Footer from "../features/Footer.jsx";
import Shop from "../features/Shop.jsx";
import ShoppingCar from "../features/ShoppingCar.jsx";
import Navbar from "../features/Navbar.jsx";
import ProductDetail from "../features/ProductDetail.jsx";

import { LoginSignup } from "../features/login-signup.jsx";
import UserPerfil from "../features/user-perfil.jsx";
import Perfil from "../features/UserProfile.jsx";
import PaymentPage from "../features/PaymentPage.jsx";

import ProductsModule from "../features/ProductsModule.jsx";
import SellerProfile from "../features/SellerProfile.jsx";
import ProductDetailEdit from "../features/ProductDetail-edit.jsx";

import PublishProduct from "../features/PublishProduct.jsx";
import MyListings from "../features/MyListings.jsx";
import CategoryPage from '../features/CategoryPage';

>>>>>>> 1580d40b68f8865583f41de655ba3cc037cace3b
import Nursery from "../features/Nursery";
import Exchange from "../features/Exchange";


import { ProductsProvider } from "../features/hooks/useProducts.jsx";

const mockProducts = [];
const mockSellers = [];

export default function App() {
  return (
    <Router>
<<<<<<< HEAD
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />              {/* Página principal */}
        <Route path="/shop" element={<Shop />} /> 
        <Route path="/shoppingcar" element={<ShoppingCar />}/>
        <Route path="/productdetail" element={<ProductDetail />}/>
        <Route path="/login" element={<Login />} />      {/* Iniciar sesión */}
        <Route path="/register" element={<Register />} />  {/* Registro */}
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* Verificación */}
        <Route path="/publish" element={<Publish />} />
        <Route path="/terms" element={<Terms />} />
         <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        {/* RUTAS EN ESPERA
        <Route path="/nursery" element={<Nursery />} /> 
        <Route path="/exchange" element={<Exchange />} /> 
        */}
      </Routes>
      <Footer />
    </Router>
=======
      <ProductsProvider>
        <Navbar />
>>>>>>> 1580d40b68f8865583f41de655ba3cc037cace3b

        <Routes>
          <Route path="/" element={<Home />} />

          {/* Páginas públicas */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/shoppingcar" element={<ShoppingCar />} />
          <Route path="/productdetail" element={<ProductDetail />} />

          {/* Login */}
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/register" element={<LoginSignup />} />

          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Perfil usuario */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editarPerfil" element={<UserPerfil />} />
          <Route path="/editarPerfil/:activepage" element={<UserPerfil />} />

          {/* Checkout */}
          <Route path="/checkout" element={<PaymentPage />} />

          {/* Módulo productos */}
          <Route path="/productos" element={<ProductsModule />} />
          <Route path="/productos/publicar" element={<PublishProduct />} />
          <Route path="/productos/mis-publicaciones" element={<MyListings />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />

          {/* DETALLE / EDICIÓN DE PRODUCTO */}
          <Route
            path="/productoeditar/:productId"
            element={<ProductDetailEdit />}
          />

          {/* Perfil vendedor */}
          <Route
            path="/vendedores/:sellerId"
            element={
              <SellerProfile sellers={mockSellers} products={mockProducts} />
            }
          />

          <Route path="/nursery" element={<Nursery />} /> 
          <Route path="/exchange" element={<Exchange />} /> 

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </ProductsProvider>
    </Router>
  );
}
