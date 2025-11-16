import React from "react";

const Sidebar = () => {
  return (
    <aside className="sidebar-container">
      <h2 className="sidebar-title">
        Filtros
      </h2>

      {/* Categorías */}
      <div className="filter-section">
        <h3 className="filter-subtitle">
          Categorías
        </h3>
        <ul className="filter-list">
          <li>
            <label className="filter-label">
              <input type="checkbox" className="filter-checkbox" />
              Interior
            </label>
          </li>
          <li>
            <label className="filter-label">
              <input type="checkbox" className="filter-checkbox" />
              Exterior
            </label>
          </li>
          <li>
            <label className="filter-label">
              <input type="checkbox" className="filter-checkbox" />
              Suculentas
            </label>
          </li>
        </ul>
      </div>

      {/* Precio */}
      <div className="filter-section">
        <h3 className="filter-subtitle">
          Precio
        </h3>
        <input
          type="range"
          min="0"
          max="1000"
          className="price-range-input"
        />
        <div className="price-range-labels">
          <span>$0</span>
          <span>$1000</span>
        </div>
      </div>

      {/* Tamaño */}
      <div>
        <h3 className="filter-subtitle">
          Tamaño
        </h3>
        <ul className="filter-list">
          <li>
            <label className="filter-label">
              <input type="checkbox" className="filter-checkbox" />
              Pequeña
            </label>
          </li>
          <li>
            <label className="filter-label">
              <input type="checkbox" className="filter-checkbox" />
              Mediana
            </label>
          </li>
          <li>
            <label className="filter-label">
              <input type="checkbox" className="filter-checkbox" />
              Grande
            </label>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;