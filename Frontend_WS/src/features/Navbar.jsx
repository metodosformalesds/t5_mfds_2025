import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { ShoppingCart, User } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

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
        <User className="icon" onClick={() => navigate("/login")} />
      </div>
    </nav>
  );
}

 

