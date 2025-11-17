// src/features/MyListings.jsx
import React from "react";
import "./MyListings.css";
import { useNavigate } from "react-router-dom";
import { useProducts } from "./hooks/useProducts.jsx";
import { formatCurrency } from "./utils/formatCurrency.js";

const MyListings = () => {
  const { products } = useProducts();
  const navigate = useNavigate();

  return (
    <div className="store-page">
      <div className="store-card">
        <div className="store-header">
          <div className="store-avatar" />
          <div className="store-info">
            <h2>Mis publicaciones</h2>
            <p>Todos los productos que tú has publicado</p>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="store-empty">No tienes publicaciones todavía.</p>
        ) : (
          <div className="store-products-row">
            {products.map((p) => (
              <article key={p.id} className="store-product-card">
                <div className="store-product-image">
                  {p.image ? (
                    <img src={p.image} alt={p.commonName || p.title} />
                  ) : (
                    <div className="store-image-placeholder" />
                  )}
                </div>

                <div className="store-product-body">
                  <h3>{p.scientificName || p.title}</h3>
                  <p className="store-product-subtitle">
                    {p.commonName || ""}
                  </p>

                  <p className="store-product-price">
                    {formatCurrency(p.price)}
                  </p>

                  <button
                    className="store-product-buy"
                    onClick={() => navigate(`/productoeditar/${p.id}`)}
                  >
                    Ver detalle
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="store-publish-bottom">
          <button
            className="store-publish-button"
            onClick={() => navigate("/productos/publicar")}
          >
            Publicar nuevo producto
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyListings;
