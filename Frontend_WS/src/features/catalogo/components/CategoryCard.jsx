import React from "react";
import "./CategoryCard.css";

export default function CategoryCard({ name, image }) {
  return (
    <div className="category-card">
      <img src={image} alt={name} className="category-image" />
      <div className="category-info">
        <p className="category-name">{name}</p>
      </div>
    </div>
  );
}
