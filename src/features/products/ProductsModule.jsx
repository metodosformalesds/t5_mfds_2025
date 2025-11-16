// src/features/products/ProductsModule.jsx
import React from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import "./ProductsModule.css";

import PublishProduct from "./pages/PublishProduct.jsx";
import MyListings from "./pages/MyListings.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

// ===== Datos de ejemplo =====
export const formatCurrency = (value, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);

const initialProducts = [
  {
    id: "1",
    sellerId: "me",
    title: "String of Hearts",
    price: 350,
    currency: "MXN",
    category: "Indoor plants",
    commonName: "String of Hearts",
    scientificName: "Ceropegia woodii",
    quantity: 5,
    width: 12,
    height: 15,
    weight: 0.3,
    description:
      "Planta colgante ideal para interiores bien iluminados. Riego moderado.",
    image:
      "https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "2",
    sellerId: "me",
    title: "Red Secret Alocasia",
    price: 350,
    currency: "MXN",
    category: "Indoor plants",
    commonName: "Red Secret Alocasia",
    scientificName: "Alocasia cuprea",
    quantity: 3,
    width: 14,
    height: 18,
    weight: 0.5,
    description:
      "Hojas metálicas rojizas, perfecta para coleccionistas. Prefiere alta humedad.",
    image:
      "https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "3",
    sellerId: "other",
    title: "Neon Pothos",
    price: 350,
    currency: "MXN",
    category: "Indoor plants",
    commonName: "Neon Pothos",
    scientificName: "Epipremnum aureum",
    quantity: 10,
    width: 15,
    height: 20,
    weight: 0.4,
    description:
      "Follaje verde neón muy resistente. Ideal para principiantes.",
    image:
      "https://images.pexels.com/photos/3076897/pexels-photo-3076897.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

const ProductsModule = () => {
  const [products, setProducts] = React.useState(initialProducts);
  const mySellerId = "me";
  const navigate = useNavigate();

  // Crear producto
  const handleCreate = (data) => {
    const newProduct = {
      ...data,
      id: Date.now().toString(),
      sellerId: mySellerId,
      currency: "MXN",
      image:
        data.image ||
        "https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=400",
    };
    setProducts((prev) => [...prev, newProduct]);
    navigate("/productos/mis-publicaciones");
  };

  // Editar producto
  const handleUpdate = (id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Eliminar producto
  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    navigate("/productos/mis-publicaciones");
  };

  const myProducts = products.filter((p) => p.sellerId === mySellerId);

  return (
    <div className="products-shell">
      <nav className="products-nav">
        <Link to="/productos/publicar">Publicar producto</Link>
        <Link to="/productos/mis-publicaciones">Mis publicaciones</Link>
        <Link to="/productos/marketplace">Todas las publicaciones</Link>
      </nav>

      <Routes>
        <Route
          path="/publicar"
          element={<PublishProduct onCreate={handleCreate} />}
        />
        <Route
          path="/mis-publicaciones"
          element={<MyListings products={myProducts} />}
        />
        <Route
          path="/marketplace"
          element={<Marketplace products={products} />}
        />
        <Route
          path="/producto/:id"
          element={
            <ProductDetail
              products={products}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default ProductsModule;
