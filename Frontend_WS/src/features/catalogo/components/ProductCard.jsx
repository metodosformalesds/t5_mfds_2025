import React from "react";
import { ShoppingCart } from "lucide-react"; // 🛒 Icono de carrito
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

        {/* 🔘 Botón “Añadir al carrito” */}
        <button className="add-to-cart-btn">
          <ShoppingCart className="cart-icon" />
          Add to cart
        </button>
      </div>
    </div>
  );
}
