
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../features/Home";
import Login from "../features/Login";
import Register from "../features/Register";
import VerifyEmail from "../features/VerifyEmail";
/*Rutas de nuevas views Y rutas en espera*/ 
import Footer from "../features/Footer";
import Shop from "../features/Shop";
import ShoppingCar from "../features/ShoppingCar";
import Navbars from "../features/Navbar";
import ProductDetail from "../features/ProductDetail";
import Publish from "../features/Publish";
{/*import Category from "../features/Category";
import Nursery from "../features/Nursery";
import Exchange from "../features/Exchange";
import ShoppingCar from "../features/ShoppingCar";*/}


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />              {/* Página principal */}
       <Route path="/navbar" element={<Navbars />} />
        <Route path="/shop" element={<Shop />} /> 
        <Route path="/shoppingcar" element={<ShoppingCar />}/>
        <Route path="/productdetail" element={<ProductDetail />}/>
        <Route path="/login" element={<Login />} />      {/* Iniciar sesión */}
        <Route path="/register" element={<Register />} />  {/* Registro */}
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* Verificación */}
        <Route path="/publish" element={<Publish />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        {/* RUTAS EN ESPERA
        <Route path="/nursery" element={<Nursery />} /> 
        <Route path="/exchange" element={<Exchange />} /> 
        */}
      </Routes>
      <Footer />
    </Router>

  );
}
