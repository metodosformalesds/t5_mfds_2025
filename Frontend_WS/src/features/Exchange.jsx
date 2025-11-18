/**

 * Autor: Alex Beltran Gallegos

 * Componente: Vista Exchange 

 * Descripción: Vista de intercambio de productos entre usuarios.

 */

import { jsxDEV } from "react/jsx-dev-runtime";
import Sidebar from "./Sidebar.jsx";
import ProductCard from "./ProductCard.jsx";
import './Exchange.css';

const Exchange = () => {
  const products = [];

  return (
    <div className="app-container">
        <header className="shop-header">
        <h1>Exchange</h1>
        <p>Exchange new things with other people</p>
      </header>
      <div className="shop-layout">
        <Sidebar />
        <div className="exchange-product-area">
          <div className="exchange-header-row">
            <select className="sort-selector">
              <option>Popular</option>
              <option>Low Price</option>
              <option>High Price</option>
              <option>Newest</option>
            </select>
          </div>
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exchange;