import React from "react";
import { ShoppingCart, User } from "lucide-react";
import "./Navbar.css";
import logo from "../../assets/Logo.png"; 

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <img src={logo} alt="Sprout Market Logo" className="navbar__img" />
        <span className="navbar__brand">Sprout Market</span>
      </div>

      <ul className="navbar__links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Shop</a></li>
        <li><a href="#">Category</a></li>
        <li><a href="#">Nursery</a></li>
        <li><a href="#">Exchange</a></li>
      </ul>

      
         <div className="navbar__actions">
            <button className="navbar__button">Publish</button>
        <ShoppingCart className="icon" />
        <User className="icon" />
        
      </div>
    </nav>
  );
}
