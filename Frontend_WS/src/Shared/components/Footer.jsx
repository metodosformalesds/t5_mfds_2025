import React from "react";
import "./Footer.css";


export default function Footer() {
  return (
    <footer className="footer-container">
      {/* Enlaces superiores */}
      <div className="footer-links">
        <ul>
          <li><a href="#">Products</a></li>
          <li><a href="#">Returns</a></li>
          <li><a href="#">About Us</a></li>
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