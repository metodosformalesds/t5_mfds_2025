import { useEffect, useState } from "react";
import api from "../api/client";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Navbars from "./Navbar";

export default function Home() {
  const navigate = useNavigate(); 
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Obtener categorías y productos
  useEffect(() => {
    api.get("/products/categories/")
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));

    api.get("/products/")
      .then(res => setProducts(res.data.slice(0, 6))) // solo primeros 6
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="home-container">
      <Navbars /> 

      {/* --- HERO --- */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            Cultiva <span className="highlight">conexiones</span>, Intercambia <span className="highlight">vida</span>
          </h1>
          <p>
            Sprout Market es el espacio donde viveros locales y coleccionistas
            se encuentran para comprar, vender e intercambiar plantas únicas.
          </p>
          
          <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/Register")}
          >
            Registrate
          </button>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">🪴</div>
        </div>
      </section>

      {/* --- SHOP BY CATEGORY --- */}
      <section className="shop-category">
        <h2>Shop <span>by Category</span></h2>
        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map(cat => (
              <div key={cat.id} className="category-card">
                <div className="category-image">🌵</div>
                <p>{cat.name}</p>
              </div>
            ))
          ) : (
            <p>No categories available</p>
          )}
        </div>
      </section>

      {/* --- NURSERY FEATURED --- */}
      <section className="nursery-featured">
        <div className="section-header">
          <h2>Nursery <span>featured</span></h2>
          <a href="#" className="view-all">View all ›</a>
        </div>

        <div className="products-grid">
          {products.map(prod => (
            <div key={prod.id} className="product-card">
              <div className="product-image">🌿</div>
              <h4>{prod.common_name}</h4>
              <p className="price">${prod.price_mxn}</p>
            </div>
          ))}
        </div>
      </section>

       <section className="exchange-section">
      <div className="exchange-content">
        <h2>Swap Plants with Your Community </h2>
        <p>
        Share your plants, pots, or accessories and discover new species for your home.</p>
        <a href="/exchange" className="exchange-button">
          Explore Exchanges
        </a>
      </div>
      <div className="products-grid">
          {products.map(prod => (
            <div key={prod.id} className="product-card">
              <div className="product-image">🌿</div>
              <h4>{prod.common_name}</h4>
              <p className="price">${prod.price_mxn}</p>
            </div>
          ))}
        </div>
     
    </section>
    </div>
  );
}
