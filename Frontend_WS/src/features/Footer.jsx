
/**

 * Autor: Erika Clara Frayre

 * Componente: Footer

 * Descripción: Muestra un el footer en de la pagina, con las linkd seleccionables y los derechos de autor.

 */
import React from "react";
import "./Footer.css";


export default function Footer() {
  return (
    <footer className="footer-container">
      {/* Enlaces superiores */}
      <div className="footer-links">
        <ul>
          <li><a href="/shop">Products</a></li>
          <li><a href="#">Returns</a></li>
          <li><a href="/productdetails">About Us</a></li>
          <li><a href="#">Contact Us</a></li>
          
        </ul>
      </div>

      {/* Franja inferior */}
      <div className="footer-bottom">
        COPYRIGHT © {new Date().getFullYear()} SPROUT MARKET. ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}

