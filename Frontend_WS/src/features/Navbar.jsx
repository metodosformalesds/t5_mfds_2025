import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar token al montar y cuando cambie auth
  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth(); // Verificar al montar

    // Escuchar cambios de autenticación
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("auth-change")); // Notificar cambio
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate("/")}>
        🌱 <span>Sprout</span> Market
      </div>

      <ul className="nav-links">
        <li onClick={() => navigate("/")}>Home</li>
        <li onClick={() => navigate("/shop")}>Shop</li>
        <li onClick={() => navigate("/category")}>Category</li>
        <li onClick={() => navigate("/nursery")}>Nursery</li>
        <li onClick={() => navigate("/exchange")}>Exchange</li>
      </ul>

      <div className="navbar__actions">
        <button
          type="button"
          className="btn-publish"
          onClick={() => navigate("/publish")}
        >
          Publish
        </button>

        <ShoppingCart className="icon" onClick={() => navigate("/shoppingcar")} />

        {!isLoggedIn ? (
          <User className="icon" onClick={() => navigate("/login")} />
        ) : (
          <LogOut className="icon" onClick={handleLogout} />
        )}
      </div>
    </nav>
  );
}