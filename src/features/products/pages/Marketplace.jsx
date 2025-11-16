// src/features/products/pages/Marketplace.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Marketplace.css";
import { formatCurrency } from "../ProductsModule.jsx";

const Marketplace = ({ products }) => {
  const navigate = useNavigate();

  return (
    <div className="market-page">
      <aside className="market-filters">
        <h3>All Categories</h3>
        <ul className="market-filter-group">
          <li>Indoor plants</li>
          <li>Outdoor plants</li>
          <li>Seeds</li>
        </ul>
        <h4>Price</h4>
        <div className="market-filter-box">Price filter (UI demo)</div>
        <h4>Include</h4>
        <div className="market-filter-box">
          <label>
            <input type="checkbox" /> Planter
          </label>
          <label>
            <input type="checkbox" /> Flowers
          </label>
          <label>
            <input type="checkbox" /> Care
          </label>
        </div>
      </aside>

      <main className="market-main">
        <div className="market-topbar">
          <div />
          <div className="market-sort">
            <span>Sort by</span>
            <select>
              <option>Popular</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
            </select>
          </div>
        </div>

        <div className="market-grid">
          {products.map((p) => (
            <article
              key={p.id}
              className="market-card"
              onClick={() => navigate(`/productos/producto/${p.id}`)}
            >
              <div className="market-card-image">
                <img src={p.image} alt={p.title} />
              </div>
              <div className="market-card-body">
                <h3>{p.title}</h3>
                <p className="market-card-price">
                  {formatCurrency(p.price)}
                </p>
                <button className="market-card-button">Buy</button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
