import { useEffect, useState } from "react";
import api from "../api/client";
import "./Shop.css"; // crea este archivo para los estilos
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // Obtener todos los productos
  useEffect(() => {
    api.get("/products/")
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="shop-container">
      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate("/")}>
          🌱 <span>Sprout</span> Market
        </div>

        <ul className="nav-links">
          <li onClick={() => navigate("/")}>Home</li>
          <li className="active">Shop</li>
          <li>Category</li>
          <li>Nursery</li>
          <li>Exchange</li>
        </ul>

        <div className="navbar__actions">
          <button
            type="button"
            className="btn-publish"
            onClick={() => navigate("/publish")}
          >
            Publish
          </button>
          <ShoppingCart className="icon" />
          <User className="icon" onClick={() => navigate("/login")} />
        </div>
      </nav>

      {/* --- SHOP CONTENT --- */}
      <section className="shop-products">
        <h2>All <span>Products</span></h2>

        <div className="products-grid">
          {products.length > 0 ? (
            products.map((prod) => (
              <div key={prod.id} className="product-card">
                <div className="product-image">🌿</div>
                <h4>{prod.common_name}</h4>
                <p className="price">${prod.price_mxn}</p>
              </div>
            ))
          ) : (
            <p>No products available</p>
          )}
        </div>
      </section>
    </div>
  );
}
