/**

 * Autor: Erika Clara Frayre

 * Componente: General category

 * Descripción: Es una pagina que muestra las categorias que se encuentran en el sistema
    para que el usuario al seleccionarla rediriga a cada categoria

 */
import { useNavigate } from "react-router-dom";
import "./GeneralCategory.css";

export default function GeneralCategory() {
  const navigate = useNavigate();

  const categories = [
    {
      slug: "plantas",
      name: "Plantas",
      image: "/assets/categories/plantas.png"
    },
    {
      slug: "semillas",
      name: "Semillas",
      image: "/assets/categories/semillas.png"
    },
    {
      slug: "insumos",
      name: "Insumos",
      image: "/assets/categories/insumos.png"
    },
    {
      slug: "herramientas",
      name: "Herramientas y Accesorios",
      image: "/assets/categories/herramientas.png"
    }
  ];

  return (
    <div className="general-category-container">
      <h1 className="gc-title">Categorías</h1>
      <p className="gc-subtitle">Explora nuestras categorías disponibles</p>

      <div className="gc-grid">
        {categories.map(cat => (
          <div 
            className="gc-card"
            key={cat.slug}
            onClick={() => navigate(`/categories/${cat.slug}`)}
          >
            <img src={cat.image} alt={cat.name} className="gc-image" />
            <h3 className="gc-name">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
