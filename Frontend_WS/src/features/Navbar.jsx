/**
 * Autor: Carlo Lara 215661
 * Componente: Navbar
 * Descripción: Barra de navegación principal del sitio, muestra enlaces, carrito y el menú de usuario con avatar, configuración y cierre de sesión.
 */

import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { ShoppingCart, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userData) {
      const user = JSON.parse(userData);
      setProfileImage(user.profile_image || null);
    }
  };

  useEffect(() => {
    checkAuth();

    window.addEventListener("auth-change", checkAuth);

    // Cerrar menú si se hace clic fuera
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);

    window.dispatchEvent(new Event("auth-change"));
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
          onClick={() => navigate("/productos/publicar")}
        >
          Publish
        </button>

        <ShoppingCart className="icon" onClick={() => navigate("/shoppingcar")} />

        {/* SI NO ESTÁ LOGUEADO → ICONO USER */}
        {!isLoggedIn ? (
          <User className="icon" onClick={() => navigate("/login")} />
        ) : (
          <div className="profile-wrapper" ref={menuRef}>
            {/* FOTO DEL USUARIO */}
            {profileImage ? (
              <img
                src={profileImage}
                alt="profile"
                className="profile-avatar"
                onClick={() => setMenuOpen(!menuOpen)}
              />
            ) : (
              <div
                className="profile-fallback"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                U
              </div>
            )}

            {/* MENU DESPLEGABLE */}
            {menuOpen && (
              <div className="profile-menu">
                <p onClick={() => navigate("/editarPerfil")}>
                  Configuración
                </p>

                <p onClick={handleLogout}>
                  Cerrar sesión
                </p>
              </div>
            )}

          </div>
        )}
      </div>
    </nav>
  );
}
