import React from "react";
import "./ExchangeSection.css";
import plantImage from "../../../assets/images/plant.jpg";

export default function ExchangeSection() {
  return (
    <section className="exchange-section">
      <div className="exchange-content">
        <h2>Swap Plants with Your Community </h2>
        <p>
        Share your plants, pots, or accessories and discover new species for your home.</p>
        <a href="/exchange" className="exchange-button">
          Explore Exchanges
        </a>
      </div>
      <div className="exchange-image-container">
        <img src={plantImage} alt="Intercambio" className="exchange-image" />
      </div>
    </section>
  );
}
