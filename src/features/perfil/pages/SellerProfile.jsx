import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SellerProfile.css";

// Formateador local
const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value || 0);

const SellerProfile = ({ sellers = [], products = [] }) => {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  // Buscar vendedor por id/slug. Si no existe, usamos datos demo.
  const seller =
    sellers.find(
      (s) =>
        String(s.id) === sellerId ||
        String(s.slug) === sellerId ||
        String(s.sellerId) === sellerId
    ) || {
      id: "demo-seller",
      name: "Erika",
      avatar: "",
      phone: "+52 656 123 4567",
      email: "erika@example.com",
      city: "Ciudad Juárez",
      country: "México",
      rating: 4.6,
      createdAt: "2022-03-10T00:00:00Z",
      totalSales: 0,
    };

  // Productos del vendedor
  let sellerProducts = products.filter(
    (p) =>
      String(p.sellerId) === String(seller.id) ||
      String(p.sellerId) === String(sellerId)
  );

  // Fallback mientras no tengas sellerId en los productos:
  if (sellerProducts.length === 0 && products.length > 0) {
    sellerProducts = products;
  }

  const rating = Number(seller.rating || 0);
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;

  let memberSince = "Miembro reciente";
  if (seller.createdAt) {
    const created = new Date(seller.createdAt);
    memberSince =
      "Miembro desde " +
      created.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
      });
  }

  return (
    <div className="seller-page">
      <button className="seller-back" onClick={() => navigate(-1)}>
        &lt; Regresar
      </button>

      {/* 🔹 Contenedor gris que envuelve todo el perfil */}
      <div className="seller-wrapper">
        {/* Encabezado del vendedor */}
        <section className="seller-header-card">
          <div className="seller-header-left">
            <div className="seller-avatar">
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.name} />
              ) : (
                <span>{(seller.name || "?").charAt(0)}</span>
              )}
            </div>
            <div>
              <h1>{seller.name}</h1>
              <p className="seller-location">
                {seller.city || "Ciudad Juárez"},{" "}
                {seller.country || "México"}
              </p>
              <p className="seller-member-since">{memberSince}</p>

              <div className="seller-rating-row">
                <div className="seller-stars">
                  {Array.from({ length: 5 }).map((_, i) => {
                    if (i < fullStars) return <span key={i}>★</span>;
                    if (i === fullStars && halfStar)
                      return <span key={i}>☆</span>;
                    return <span key={i}>☆</span>;
                  })}
                </div>
                <span className="seller-rating-value">
                  {rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          </div>

          <div className="seller-header-right">
            <div className="seller-contact-item">
              <span className="label">Teléfono</span>
              <span>{seller.phone || "+52 656 123 4567"}</span>
            </div>
            <div className="seller-contact-item">
              <span className="label">Correo</span>
              <span>{seller.email || "correo@example.com"}</span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="seller-stats-card">
          <div className="seller-stat">
            <span className="seller-stat-number">
              {sellerProducts.length}
            </span>
            <span className="seller-stat-label">
              Productos publicados
            </span>
          </div>
          <div className="seller-stat">
            <span className="seller-stat-number">
              {seller.totalSales || 0}
            </span>
            <span className="seller-stat-label">Ventas</span>
          </div>
          <div className="seller-stat">
            <span className="seller-stat-number">
              {seller.rating ? seller.rating.toFixed(1) : "–"}
            </span>
            <span className="seller-stat-label">Calificación</span>
          </div>
        </section>

        {/* Productos del vendedor */}
        <section className="seller-products-section">
          <h2>Productos de {seller.name}</h2>

          {sellerProducts.length === 0 ? (
            <p className="seller-empty">
              Este vendedor aún no tiene productos publicados.
            </p>
          ) : (
            <div className="seller-products-grid">
              {sellerProducts.map((p) => (
                <article key={p.id} className="seller-product-card">
                  <div className="seller-product-image">
                    <img src={p.image} alt={p.title} />
                  </div>
                  <div className="seller-product-body">
                    <h3>{p.scientificName || p.title}</h3>
                    <p className="seller-product-subtitle">
                      {p.commonName || ""}
                    </p>
                    <p className="seller-product-price">
                      {formatCurrency(p.price)}
                    </p>
                    <button
                      className="seller-product-button"
                      onClick={() =>
                        navigate(`/productos/producto/${p.id}`)
                      }
                    >
                      Ver detalle
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerProfile;
