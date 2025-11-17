import { useEffect, useState } from "react";
import api from "../api/client";
import "./home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate(); 
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Cargar categorías y productos
  useEffect(() => {
    api.get("/categories/")
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : raw?.results || raw?.categories || raw?.data || [];
        setCategories(list);
      })
      .catch(() => setCategories([]));

    api.get("/products/")
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw?.results || [];
        setProducts(list.slice(0, 4)); // Primeros 6 productos
      })
      .catch(() => setProducts([]));
  }, []);

  // Imágenes de cada categoría
  const categoryImages = {
    "Plantas": "/assets/Plantas.jpg",
    "Semillas": "/assets/semillas.png",
    "Insumos": "/assets/Insumos.png",
    "Herramientas y Accesorios": "/assets/Herramientes.png",
  };

  // Mapeo de nombres de categorías a slugs para URLs
  const categorySlugMap = {
    "Plantas": "plantas",
    "Semillas": "semillas",
    "Insumos": "insumos",
    "Herramientas y Accesorios": "herramientas"
  };

  const handleCategoryClick = (categoryName) => {
    const slug = categorySlugMap[categoryName];
    if (slug) {
      navigate(`/category/${slug}`);
    }
  };

  return (
    <div className="home-container">

      {/* === HERO === */}
      {!localStorage.getItem("access_token") && (
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
              Regístrate
            </button>
          </div>

          <div className="hero-image">
            <div className="image-placeholder">🪴</div>
          </div>
        </section>
      )}



      {/* === CATEGORÍAS === */}
      <section className="category-section">
        <h2 className="section-title">Shop <span>by Category</span></h2>

        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map(cat => (
              <div 
                key={cat.id} 
                className="category-card"
                onClick={() => handleCategoryClick(cat.name)}
              >
                <div className="category-image">
                  <img
                    src={categoryImages[cat.name] || "/assets/default_cat.png"}
                    alt={cat.name}
                  />
                </div>
                <p className="category-name">{cat.name}</p>
              </div>
            ))
          ) : (
            <p>No categories available</p>
          )}
        </div>
      </section>


      {/* === PRODUCTOS RECIENTES / RECOMENDADOS === */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Featured <span>Products</span></h2>
          <a href="/shop" className="view-all">View all ›</a>
        </div>

        <div className="products-grid">
          {products.map(prod => (
            <div key={prod.id} className="product-card">
              <div className="product-image">
                <img src={prod.main_image} alt={prod.common_name} />
              </div>

              <h4 className="product-name">{prod.common_name}</h4>
              <p className="price">${prod.price_mxn}</p>
            </div>
          ))}
        </div>
      </section>


      {/* === EXCHANGE SECTION === */}
      <section className="exchange-section">
        <div className="exchange-content">
          <h2>Swap Plants with Your Community</h2>
          <p>
            Share your plants, pots, or accessories and discover new species 
            for your home.
          </p>

          <a href="/exchange" className="exchange-button">
            Explore Exchanges
          </a>
        </div>

        <div className="products-grid">
          {products.length > 0 && (() => {
            const randomIndex = Math.floor(Math.random() * products.length);
            const prod = products[randomIndex];

            return (
              <div key={prod.id} className="product-card">
                <div className="product-image">
                  <img src={prod.main_image} alt={prod.common_name} />
                </div>

                <h4 className="product-name">{prod.common_name}</h4>
                <p className="price">${prod.price_mxn}</p>
              </div>
            );
          })()}
        </div>

      </section>

    </div>
  );
}