import React from "react";
import "./ProductCard.css";

export default function ProductCard({ name = "Producto", price = "0.00", image }) {
  return (
    <div className="product-card">
      <img
        src={image || "/plant.jpg"}
        alt={name}
        className="product-image"
      />
      <div className="product-info">
        <p className="product-name">{name}</p>
        <p className="product-price">${price}</p>
      </div>
    </div>
  );
}