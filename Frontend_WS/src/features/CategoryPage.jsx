/**
 * Autor: Carlo Lara 215661
 * Componente: CategoryPage
 * Descripción: Muestra productos filtrados por categoría y permite refinar la búsqueda.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./categoryPage.css";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo de slugs a nombres de categorías
  const categoryNames = {
    "plantas": "Plantas",
    "semillas": "Semillas",
    "insumos": "Insumos",
    "herramientas": "Herramientas y Accesorios"
  };

  useEffect(() => {
    setLoading(true);
    
    // Cargar todas las categorías para obtener el ID
    api.get("/categories/")
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : raw?.results || raw?.categories || raw?.data || [];
        
        const categoryName = categoryNames[categorySlug];
        const foundCategory = list.find(cat => cat.name === categoryName);
        
        if (foundCategory) {
          setCategory(foundCategory);
          // CORREGIDO: usar 'categories' (plural) en lugar de 'category'
          return api.get(`/products/?categories=${foundCategory.id}`);
        } else {
          throw new Error("Categoría no encontrada");
        }
      })
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw?.results || [];
        console.log('Productos filtrados:', list); // Para debug
        setProducts(list);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
        setProducts([]);
        setLoading(false);
      });
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="category-page-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-page-container">
        <div className="error-message">
          <h2>Categoría no encontrada</h2>
          <button onClick={() => navigate("/")} className="btn-back">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page-container">
      {/* Header de la categoría */}
      <div className="category-header">
        <button onClick={() => navigate("/")} className="btn-back">
          ← Volver
        </button>
        <h1 className="category-title">{category.name}</h1>
        <p className="category-description">
          {category.description || `Explora nuestra colección de ${category.name.toLowerCase()}`}
        </p>
        <div className="category-stats">
          <span className="product-count">{products.length} productos disponibles</span>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="category-products-section">
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map(prod => (
              <div 
                key={prod.id} 
                className="product-card"
                onClick={() => navigate(`/product/${prod.id}`)}
              >
                <div className="product-image">
                  <img 
                    src={prod.main_image || "/assets/default_product.png"} 
                    alt={prod.common_name} 
                  />
                </div>
                <div className="product-info">
                  <h4 className="product-name">{prod.common_name}</h4>
                  {prod.scientific_name && (
                    <p className="product-scientific">{prod.scientific_name}</p>
                  )}
                  <div className="product-footer">
                    <p className="price">${prod.price_mxn}</p>
                    {prod.quantity !== undefined && (
                      <span className={`stock-badge ${prod.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
                        {prod.quantity > 0 ? `${prod.quantity} disponibles` : 'Agotado'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">
            <div className="no-products-icon">🌱</div>
            <h3>No hay productos disponibles</h3>
            <p>Aún no hay productos en esta categoría. ¡Vuelve pronto!</p>
          </div>
        )}
      </div>
    </div>
  );
}