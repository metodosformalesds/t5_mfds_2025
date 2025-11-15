import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate("/")}>
          <div className="logo-icon">🌱</div>
          <span className="logo-text">
            <strong>Sprout</strong> Market
          </span>
        </div>

        {/* Navegación principal */}
        <nav className="header-nav">
          <button className="nav-item active" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="nav-item" onClick={() => navigate("/shop")}>
            Shop
          </button>
          <button className="nav-item" onClick={() => navigate("/category")}>
            Category
          </button>
          <button className="nav-item" onClick={() => navigate("/nursery")}>
            Nursery
          </button>
          <button className="nav-item" onClick={() => navigate("/exchange")}>
            Exchange
          </button>
        </nav>

        {/* Acciones del usuario */}
        <div className="header-actions">
          {/* Botón Publish */}
          <button className="btn-publish" onClick={() => navigate("/publish")}>
            PUBLISH
          </button>

          {/* Carrito */}
          <button className="btn-cart" onClick={() => navigate("/cart")}>
            🛒
          </button>

          {/* Perfil de usuario */}
          <div className="user-menu">
            <button className="btn-user" onClick={() => navigate("/profile")}>
              👤
            </button>
            {/* Dropdown para logout (puedes expandirlo después) */}
            <div className="user-dropdown">
              <button onClick={() => navigate("/profile")}>Mi Perfil</button>
              <button onClick={() => navigate("/orders")}>Mis Órdenes</button>
              <button onClick={handleLogout}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}