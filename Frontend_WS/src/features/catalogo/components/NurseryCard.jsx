import React from "react";
import ProductCard from "./ProductCard";
import "./NurseryCard.css";

export default function NurseryCard({ name, location, avatar, catalog = [] }) {
  return (
    <div className="nursery-card">
      {/* Encabezado del vivero */}
      <div className="nursery-header">
        <img
          src={avatar || "/plant.jpg"}
          alt={name}
          className="nursery-avatar"
        />
        <div className="nursery-info">
          <p className="nursery-name">{name}</p>
          <br></br>
          <p className="nursery-location">{location}</p>
        </div>
      </div>

      {/* Catálogo */}
      <div className="nursery-catalog">
        {catalog.map((plant, i) => (
          <ProductCard key={i} {...plant} />
        ))}
      </div>
    </div>
  );
}
