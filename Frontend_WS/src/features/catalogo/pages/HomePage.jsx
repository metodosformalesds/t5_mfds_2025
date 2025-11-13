import React from "react";
import ProductCard from "../components/ProductCard";
import NurseryCard from "../components/NurseryCard";
import CategoryCard from "../components/CategoryCard";
import ExchangeSection from "../components/ExchangeSection";
import Footer from "../../../Shared/components/Footer";
import "./HomePage.css";

// ✅ Importa una sola imagen para todo
import plantImage from "../../../assets/images/plant.jpg";

// ✅ Datos simulados con la misma imagen
const featuredCategories = [
  { name: "Plantas de interior", image: plantImage },
  { name: "Suculentas", image: plantImage },
  { name: "Macetas", image: plantImage },
];

const featuredProducts = [
  { name: "Monstera Deliciosa", price: "25.00", image: plantImage },
  { name: "Cactus", price: "15.00", image: plantImage },
  { name: "Maceta de cerámica", price: "10.00", image: plantImage },
];

const nurseries = [
  {
    name: "Vivero Tu espacio verde",
    location: "Ciudad Juárez, Chihuahua",
    avatar: plantImage,
    catalog: [
      { name: "String of Hearts", price: "35.00", image: plantImage },
      { name: "Red Secret Alocasia", price: "35.00", image: plantImage },
      { name: "Jewel Alocasia", price: "35.00", image: plantImage },
      { name: "Hoya Retusa", price: "35.00", image: plantImage },
    ],
  },
  {
    name: "Green Haven",
    location: "Guadalajara, Jalisco",
    avatar: plantImage,
    catalog: [
      { name: "Ficus Lyrata", price: "40.00", image: plantImage },
      { name: "Snake Plant", price: "25.00", image: plantImage },
      { name: "Peace Lily", price: "30.00", image: plantImage },
      { name: "ZZ Plant", price: "28.00", image: plantImage },
    ],
  },
  {
    name: "La Casa del Cactus",
    location: "Puebla, Puebla",
    avatar: plantImage,
    catalog: [
      { name: "Golden Barrel", price: "20.00", image: plantImage },
      { name: "Echeveria", price: "15.00", image: plantImage },
      { name: "Aloe Vera", price: "18.00", image: plantImage },
      { name: "Haworthia", price: "22.00", image: plantImage },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <div className="home-container">
        {/* Hero Section */}
        <section
          className="hero-section"
        >
          <div className="hero-content">
            <h1 className="hero-title">
              Cultivate connections,<br /> exchange life
            </h1>
            <p className="hero-subtitle">
              Explore plants, pots, and sustainable items share by your community.
            </p>
            <div className="hero-button-container">
              <a href="/register" className="hero-button">
                Sign up
              </a>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="categories-section">
          <div className="category-header">
            <h2 className="category-title">Shop by Category</h2>
            <a href="/catalogo" className="category-link">Shop All →</a>
          </div>
          <div className="grid-container">
            {featuredCategories.map((cat, i) => (
              <CategoryCard key={i} {...cat} />
            ))}
          </div>
        </section>

        {/* Productos */}
        <section className="products-section">
          <div className="product-header">
            <h2 className="product-title">Best selling</h2>
            <a href="/catalogo" className="product-link">Shop All →</a>
          </div>
          <div className="grid-container">
            {featuredProducts.map((prod, i) => (
              <ProductCard key={i} {...prod} />
            ))}
          </div>
        </section>

        {/* Viveros */}
        <section className="nursery-section">
          <div className="nursery-header">
            <h2 className="nursery-title">Nursery featured </h2>
            <a href="#" className="nursery-link">Shop All →</a>
          </div>

          <div className="nursery-list">
            {nurseries.map((nursery, i) => (
              <NurseryCard key={i} {...nursery} />
            ))}
          </div>
        </section>

        {/* Intercambio */}
        <ExchangeSection />
      </div>

      
    </>
  );
}
