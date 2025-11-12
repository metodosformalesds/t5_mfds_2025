import React from "react";
import "./ExchangeSection.css";
import plantImage from "../../../assets/images/plant.jpg";

export default function ExchangeSection() {
  return (
    <section className="exchange-section">
      <div className="exchange-content">
        <h2>Intercambia plantas con tu comunidad </h2>
        <p>
          Comparte tus plantas, macetas o accesorios y encuentra nuevas especies para tu hogar.
        </p>
        <a href="/exchange" className="exchange-button">
          Explorar intercambios
        </a>
      </div>
      <div className="exchange-image-container">
        <img src={plantImage} alt="Intercambio" className="exchange-image" />
      </div>
    </section>
  );
}
