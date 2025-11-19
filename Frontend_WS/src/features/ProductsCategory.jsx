/**

 * Autor: Erika Clara Frayre

 * Componente: Products category.jsx

 * Descripción: Es la pagina para  que muestre los productos de la categoria seleccionada por el usuario

 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./categoryPage.css";

export default function ProductsCategory() {

  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryNames = {
    plantas: "Plantas",
    semillas: "Semillas",
    insumos: "Insumos",
    herramientas: "Herramientas y Accesorios"
  };

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);

      try {
        // 1. Obtener lista total
        const res = await api.get("/categories/");
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];

        // 2. Convertir slug → nombre
        const mappedName = categoryNames[categorySlug];
        const found = list.find(cat => cat.name === mappedName);

        if (!found) {
          setCategory(null);
          setLoading(false);
          return;
        }

        setCategory(found);

        // 3. Cargar productos de esa categoría
        const productRes = await api.get(`/products/?categories=${found.id}`);
        const productList = Array.isArray(productRes.data)
          ? productRes.data
          : productRes.data?.results || [];

        setProducts(productList);
      } catch (err) {
        console.error("Error:", err);
      }

      setLoading(false);
    }

    loadCategory();
  }, [categorySlug]);

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  if (!category) {
    return (
      <div className="cat-not-found">
        <h2>Categoría no encontrada</h2>
        <button className="btn-back" onClick={() => navigate("/generalcategory")}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="cat-page-container">
      <div className="cat-header">
        <button className="btn-back" onClick={() => navigate("/generalcategory")}>
          ← Volver
        </button>

        <h1 className="cat-title">{category.name}</h1>
        <p className="cat-desc">{category.description}</p>
        <span className="cat-count">{products.length} productos</span>
      </div>

      <div className="cat-products-grid">
        {products.map(item => (
          <div key={item.id} className="product-card">
            <img src={item.main_image} alt={item.common_name} className="product-image" />

            <h4 className="product-name">{item.common_name}</h4>

            <p className="price">${item.price_mxn}</p>

            <button 
              className="buy-btn"
              onClick={() => navigate(`/productdetail/${item.id}`)}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
