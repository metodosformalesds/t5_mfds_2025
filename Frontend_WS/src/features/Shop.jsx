
import { useEffect, useState } from "react";
import api from "../api/client";
import "./Shop.css";
import { ChevronDown } from "lucide-react";
import Navbars from "./Navbar";

export default function Shop() {

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
    
  // Filtros
  const [filters, setFilters] = useState({
    seller__username: "",
    seller__city: "",
    seller__is_premium: "",
    in_stock: "",
    common_name: "",
    status: "",
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      const response = await api.get("/products/", {
        params: filters,
      });
      setProducts(response.data.results || response.data);
      setTotal(response.data.count || response.data.length);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="shop-page">
 <Navbars /> 
      {/* 
      HEADER DE LA PÁGINA
    */}
      <header className="shop-header">
        <h1>Shop</h1>
        <p>Find the perfect plant for your space</p>
      </header>

      {/* =
                LAYOUT PRINCIPAL
      */}
      <div className="shop-layout">

        {/* SIDEBAR  */}
        <aside className="shop-sidebar">

          <h3>Filters</h3>

          <div className="filter-box">
            <label>Search by name</label>
            <input
              type="text"
              placeholder="Common name"
              onChange={(e) => updateFilter("common_name", e.target.value)}
            />
          </div>

          <div className="filter-box">
            <label>Seller username</label>
            <input
              type="text"
              placeholder="seller123"
              onChange={(e) => updateFilter("seller__username", e.target.value)}
            />
          </div>

          <div className="filter-box">
            <label>Seller city</label>
            <input
              type="text"
              placeholder="City"
              onChange={(e) => updateFilter("seller__city", e.target.value)}
            />
          </div>

          <div className="filter-box">
            <label>Premium sellers only</label>
            <select onChange={(e) => updateFilter("seller__is_premium", e.target.value)}>
              <option value="">All</option>
              <option value="true">Premium only</option>
            </select>
          </div>

          <div className="filter-box">
            <label>In stock</label>
            <select onChange={(e) => updateFilter("in_stock", e.target.value)}>
              <option value="">All</option>
              <option value="true">Available only</option>
            </select>
          </div>

          <div className="filter-box">
            <label>Status</label>
            <select onChange={(e) => updateFilter("status", e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

        </aside>

        {/* PRODUCTOS */}
        <section className="shop-products">
          <div className="products-header">
            <p>Showing {total} products</p>

            <div className="sort-box">
              <span>Sort by</span>
              <select>
                <option value="popular">Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <ChevronDown />
            </div>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} item={product} />
            ))}
          </div>

        </section>
      </div>
    </div>
  );
}

function ProductCard({ item }) {
  return (
    <div className="product-card">
      <img
        src={item.main_image}
        alt={item.common_name}
        className="product-image"
      />

      <h4>{item.common_name}</h4>

      <p className="price">$ {item.price_mxn}</p>

      <button className="buy-btn">Buy</button>
    </div>
  );
}

