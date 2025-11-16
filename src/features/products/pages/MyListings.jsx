// src/features/products/pages/MyListings.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyListings.css";
import { formatCurrency } from "../ProductsModule.jsx";

const MyListings = ({ products }) => {
  const navigate = useNavigate();

  return (
    <div className="store-page">
      <div className="store-card">
        <div className="store-header">
          <div className="store-avatar" />
          <div className="store-info">
            <h2>Vivero Tu espacio verde</h2>
            <p>Ciudad Juárez, Chihuahua</p>
            <p className="store-description">
              Gracias por elegir a Tu Espacio Verde 💚 <br />
              Ofrecemos productos de alta calidad, con el cuidado necesario.
              <br />• Envíos locales por paquetería. <br />
              Ubicación: Ciudad Juárez, Chihuahua.
            </p>
          </div>
        </div>

        <div className="store-products-row">
          {products.map((p) => (
            <article key={p.id} className="store-product-card">
              <div className="store-product-image">
                <img src={p.image} alt={p.title} />
              </div>
              <div className="store-product-body">
                {/* Título: nombre científico (o title como fallback) */}
                <h3>{p.scientificName || p.title}</h3>

                {/* Subtítulo: common name */}
                <p className="store-product-subtitle">
                  {p.commonName || "Sin nombre común"}
                </p>

                {/* Precio */}
                <p className="store-product-price">
                  {formatCurrency(p.price)}
                </p>

                <button
                  className="store-product-buy"
                  onClick={() => navigate(`/productos/producto/${p.id}`)}
                >
                  Ver detalle
                </button>
              </div>
            </article>
          ))}

          {products.length === 0 && (
            <p className="store-empty">
              Aún no tienes productos publicados. Crea tu primera publicación.
            </p>
          )}
        </div>
      </div>

      <div className="store-publish-bottom">
        <Link to="/productos/publicar" className="store-publish-button">
          PUBLISH
        </Link>
      </div>
    </div>
  );
};

export default MyListings;
