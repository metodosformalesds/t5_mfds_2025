import { jsxDEV } from "react/jsx-dev-runtime";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import ProductCard from "./ProductCard.jsx";
import './Nursery.css';

const Exchange = () => {
  const products = [
    {
      name: "Marble Queen",
      price: 350,
      image:
        "https://images.unsplash.com/photo-1604937455091-efb8d6798b5c?auto=format&fit=crop&w=500&q=60",
    },
    {
      name: "Neon Pothos",
      price: 350,
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=500&q=60",
    },
    {
      name: "Chinese Evergreen",
      price: 350,
      image:
        "https://images.unsplash.com/photo-1560184897-0e2e9b1f1f2d?auto=format&fit=crop&w=500&q=60",
    },
    // ... agrega más productos si quieres
  ];

  return (
    <div className="app-container">
      <Navbar />

      <main className="exchange-main-content">
        {/* Sidebar Filtros */}
        <Sidebar />

        {/* Contenido principal */}
        <div className="exchange-product-area">
          <div className="exchange-header-row">
            <h1 className="exchange-title">Exchange</h1>

            {/* Selector de ordenamiento */}
            <select className="sort-selector">
              <option>Popular</option>
              <option>Low Price</option>
              <option>High Price</option>
              <option>Newest</option>
            </select>
          </div>

          {/* Grid de productos */}
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exchange;