/**

 * Autor: Alex Beltran Gallegos

 * Componente: Sidebar

 * Descripción: Sidebar con filtros para buscar productos en las vistas Nursery y Exchange.

 */

import React from "react";

const Sidebar = ({ updateFilter = () => {} }) => {
    
  return (
    <aside className="shop-sidebar">

      <h3>Filters</h3>

      <div className="filter-box">
        <label>Search by name</label>
        <input
          type="text"
          placeholder="Common name"
          onChange={(e) => updateFilter("common_name", e.target.value)}
        />
      </div>

      <div className="filter-box">
        <label>Seller username</label>
        <input
          type="text"
          placeholder="seller123"
          onChange={(e) => updateFilter("seller__username", e.target.value)}
        />
      </div>

      <div className="filter-box">
        <label>Seller city</label>
        <input
          type="text"
          placeholder="City"
          onChange={(e) => updateFilter("seller__city", e.target.value)}
        />
      </div>

      <div className="filter-box">
        <label>Premium sellers only</label>
        <select onChange={(e) => updateFilter("seller__is_premium", e.target.value)}>
          <option value="">All</option>
          <option value="true">Premium only</option>
        </select>
      </div>

      <div className="filter-box">
        <label>In stock</label>
        <select onChange={(e) => updateFilter("in_stock", e.target.value)}>
          <option value="">All</option>
          <option value="true">Available only</option>
        </select>
      </div>

      <div className="filter-box">
        <label>Status</label>
        <select onChange={(e) => updateFilter("status", e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

    </aside>
  );
};

export default Sidebar;