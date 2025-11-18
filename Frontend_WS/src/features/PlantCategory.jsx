import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./PlantCategory.css";
import Navbar from "./Navbar";

export default function PlantsPage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_NAME = "Plantas";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Buscar ID de la categoría Plantas
        const resCat = await api.get("/categories/");
        const list = Array.isArray(resCat.data)
          ? resCat.data
          : resCat.data.results || [];

        const found = list.find((c) => c.name === CATEGORY_NAME);

        if (!found) {
          setCategory(null);
          setProducts([]);
          setLoading(false);
          return;
        }

        setCategory(found);

        // 2. Obtener productos de la categoría
        const resProd = await api.get(`/products/?categories=${found.id}`);

        const prodList = Array.isArray(resProd.data)
          ? resProd.data
          : resProd.data.results || [];

        setProducts(prodList);
      } catch (e) {
        console.error("Error loading plants:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="plants-loading">Cargando plantas...</div>;
  }

  if (!category) {
    return (
      <div className="plants-error">
        <h2>No se encontró la categoría</h2>
        <button onClick={() => navigate("/shop")} className="btn-back">
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    
    <div className="plants-content-container">
      {/* --- HEADER --- */}
      <div className="plants-header">
        <h1>{category.name}</h1>
        <p>Descubre nuestra selección de plantas de interior y exterior.</p>
      </div>

      {/* --- FILTROS --- */}
      <div className="plants-filter-bar">
        <span className="filter-count">{products.length} productos</span>

        <select className="filter-sort">
          <option>Popular</option>
          <option>Menor precio</option>
          <option>Mayor precio</option>
          <option>Más reciente</option>
        </select>
      </div>

      {/* --- GRID DE PRODUCTOS --- */}
      <div className="plants-grid">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="plant-card"
            onClick={() => navigate(`/product/${prod.id}`)}
          >
            <div className="plant-image-box">
              <img
                src={prod.main_image || "/assets/default_product.png"}
                alt={prod.common_name}
              />
            </div>

            <h3 className="plant-name">{prod.common_name}</h3>

            <p className="plant-price">${prod.price_mxn}</p>

            <button className="plant-buy-btn">Comprar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
