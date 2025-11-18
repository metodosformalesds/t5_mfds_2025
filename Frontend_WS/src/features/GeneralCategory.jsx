import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import "./GeneralCategory.css";

export default function GeneralCategory() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const categorySlugMap = {
    "Plantas": "plant",
    "Semillas": "semillas",
    "Insumos": "insumos",
    "Herramientas y Accesorios": "herramientas"
  };

  const categoryImages = {
    "Plantas": "/assets/Plantas.jpg",
    "Semillas": "/assets/semillas.png",
    "Insumos": "/assets/Insumos.png",
    "Herramientas y Accesorios": "/assets/Herramientes.png"
  };

  useEffect(() => {
    api.get("/categories/")
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];

        setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  const goToCategory = (name) => {
    const slug = categorySlugMap[name];
    if (slug) navigate(`/category/${slug}`);
  };

  return (
    <div className="categories-page-container">
      <h1 className="categories-title">Categories</h1>

      <div className="categories-grid">
        {categories.map(cat => (
          <div 
            key={cat.id}
            className="category-card"
            onClick={() => goToCategory(cat.name)}
          >
            <img 
              src={categoryImages[cat.name] || "/assets/default_cat.png"} 
              alt={cat.name}
            />
            <p>{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
